import { DataSet } from "vis-timeline/standalone";

const dataset = new DataSet();
const isMonitoring = ref(true);

const toggleMonitoring = () => isMonitoring.value = !isMonitoring.value;

export const useCpuMonitor = async (interval = 10000) => {
  const { data: cpuData, refresh, error } = await useFetch('/api/cpu-load')

  setInterval(() => {
    if (!isMonitoring.value) return;
    refresh();
  }, interval)

  watch(cpuData, (newData) => {
    dataset.add({
      x: newData.timestamp,
      y: newData.load
    } as any)
  })

  return {
    dataset,
    latestData: cpuData,
    error: error,
    refresh,
    isMonitoring,
    toggleMonitoring,
  }
}