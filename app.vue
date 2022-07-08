<template>
  <h1>CPU Load Tracker</h1>
  <pre>Infatuation take-home, 2022-07-08</pre>
  <button @click="() => refresh()">Fetch CPU</button>
  <pre v-if="error">Error loading CPU Data</pre>
  <pre>{{ JSON.stringify(latestData, null, 2) }}</pre>

  <button @click="toggleMonitoring">{{ isMonitoring ? "Turn off monitoring" : "Turn on monitoring"}}</button>
  <div id="cpuChart"></div>
</template>

<script setup lang="ts">
import { Timeline, Graph2d, moment, Graph2dOptions } from "vis-timeline/standalone";

const REFRESH_RATE = 1000; // 10X before submitting XD ms
const graph2d = ref<null | Graph2d>(null);

const {
  dataset,
  latestData,
  error,
  refresh,
  isMonitoring,
  toggleMonitoring
} = await useCpuMonitor();

watch(latestData, () => {
  if (graph2d.value !== null) {
    graph2d.value.setWindow(
      moment().subtract(4, 'minutes').toDate(),
      moment().add(25, 'seconds').toDate(),
      { animation: false }
    );
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
          min: -0.1,
          max: 1.1,
        },
      },
    },
    drawPoints: {
      style: "circle",
      size: 3,
    }
  };

  graph2d.value = new Graph2d(container, dataset, options);
})
</script>

<style>
html, body { margin: 0; }
body {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  padding: 0 30px;
}
* {
  box-sizing: inherit;
}
</style>