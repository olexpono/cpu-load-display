<template>
  <main class="main">
    <pre>Infatuation take-home, 2022-07-08</pre>
    <!--
    <button @click="() => refresh()">Fetch CPU</button>
    <pre v-if="error">Error loading CPU Data</pre>
    <pre>{{ JSON.stringify(latestData, null, 2) }}</pre>
    -->
    <div class="header-with-controls">
      <h3>CPU Load (1 min avg)</h3>
      <div>
          <button @click="toggleMonitoring">{{ isMonitoring ? "Turn off monitoring" : "Turn on monitoring"}}</button>
          <button @click="toggleRenderAnimation()">{{ isRenderingFast ? "Static chart" : "Continuous chart" }}</button>
      </div>
    </div>
    <div class="cpu-chart" id="cpuChart"></div>
    <h3>Status change log</h3>
    <ul class="status-list">
      <li v-for="status of alertsData.statusHistory">
        Status
        {{ !!status.endInclusive ? 'was' : 'is' }}
        <span class="badge" :class="{'badge__alert': status.status === 'overloaded'}">{{ status.status }}</span>
        starting <Timestamp :time="status.startTime" />
        {{ !!status.endInclusive ? 'until' : '' }}
        <Timestamp v-if="!!status.endInclusive" :time="status.endInclusive" />
      </li>
    </ul>
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
  alertsData,
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

/* Alt. for static chart -> snap to default window on every new data point
watch(latestData, () => {
  if(!isRenderingFast.value) {
    snapWindowToDefaultRange();
  }
}) */

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
    height: 340,
    dataAxis: {
      left: {
        range: {
          min: 0,
          max: 1.5,
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
    }, 250);
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
  --red: #DB5D32;
}

body {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  padding: 0 30px;
  color: var(--fg);
  background-color: #353535;
}

code {
  font-family: "Menlo", monospace;
  font-size: 14px;
}

button {
  display: inline-flex;
  padding: 0.2em 0.7em;
  line-height: 1.25;
  font-size: 15px;
  border-style: outset;
  border-radius: 2.5px;
}
button + button {
  margin-left: 0.5em;
}

.main {
  max-width: 920px;
  margin: 0 auto;
}

.header-with-controls {
  display: flex;
  align-items: center;
}
.header-with-controls > :first-child {
  flex-shrink: 1;
  margin-right: auto;
}

.cpu-chart {
  height: 340px;
}

.status-list {
  list-style: '→ ';
  display: flex;
  flex-direction: column-reverse;
}

.badge {
  display: inline-block;
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  border-radius: 2.5px;
  color: var(--white);
  background-color: var(--darkgray);
}

.badge.badge__alert {
  background-color: var(--red);
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