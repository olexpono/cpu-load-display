<template>
  <main class="main">
    <pre>Infatuation take-home, 2022-07-08</pre>
    <!--<button @click="() => refresh()">Fetch CPU</button>
    <pre v-if="error">Error loading CPU Data</pre>
    <pre>{{ JSON.stringify(latestData, null, 2) }}</pre>
    -->
    <button @click="toggleMonitoring">{{ isMonitoring ? "Turn off monitoring" : "Turn on monitoring"}}</button>
    <button @click="toggleRenderAnimation()">{{ isRenderingFast ? "Render slower" : "Render continuously" }}</button>
    <h3>CPU Load (1 min avg)</h3>
    <div id="cpuChart"></div>
  </main>
</template>

<script setup lang="ts">
import { Timeline, Graph2d, moment, Graph2dOptions } from "vis-timeline/standalone";

const REFRESH_RATE = 10000;
const START_CONTINUOUS_RENDER = true;

const graph2d = ref<null | Graph2d>(null);

const isRenderingFast = ref(false);
const toggleRenderAnimation = () => isRenderingFast.value = !isRenderingFast.value;

const {
  dataset,
  latestData,
  error,
  refresh,
  isMonitoring,
  toggleMonitoring
} = await useCpuMonitor(REFRESH_RATE);

const snapWindowToDefaultRange = () => {
  if (graph2d.value == null) { return; }
  graph2d.value.setWindow(
    moment().subtract(4, 'minutes').toDate(),
    moment().add(25, 'seconds').toDate(),
    { animation: false }
  );
}

watch(latestData, () => {
  if(!isRenderingFast.value) {
    snapWindowToDefaultRange();
  }
})

const renderContinuously = () => {
  snapWindowToDefaultRange();
  if (isRenderingFast.value) {
    requestAnimationFrame(renderContinuously)
  }
}

watch(isRenderingFast, () => {
  if (isRenderingFast.value) {
    renderContinuously();
  }
})

onMounted(() => {
  const container = document.getElementById("cpuChart")
  const options: Graph2dOptions = {
    start: moment().add(-30, "seconds").toDate(),
    end: moment().toDate(),
    dataAxis: {
      left: {
        range: {
          min: -0.08,
          max: 1.08,
        },
      },
    },
    drawPoints: {
      style: "circle",
      size: 3,
    }
  };

  graph2d.value = new Graph2d(container, dataset, options);
  refresh();
  if (START_CONTINUOUS_RENDER) {
    setTimeout(() => {
      isRenderingFast.value = true;
      renderContinuously();
    }, 12500);
  }
})
</script>

<style>
html, body { margin: 0; }
* {
  box-sizing: inherit;
}
:root {
  --white: #fafafa;
  --fg: #dadada;
  --darkgray: #5a5a5a;
}

body {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  padding: 0 30px;
  color: var(--fg);
  background-color: #353535;
}

.main {
  max-width: 920px;
  margin: 0 auto;
}


/* Visjs edits */
.vis-timeline {
  border-color: var(--darkgray);
}
.vis-data-axis .vis-y-axis.vis-major {
  color: var(--white);
}

.vis-time-axis .vis-text {
  color: var(--fg);
}
.vis-panel.vis-background.vis-horizontal .vis-grid.vis-minor,
.vis-panel.vis-background.vis-vertical .vis-grid.vis-minor {
  border-color: var(--darkgray);
}
</style>