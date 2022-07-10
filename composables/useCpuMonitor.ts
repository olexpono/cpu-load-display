import { DataSet, moment } from "vis-timeline/standalone";

type LoadStatus = "ok" | "overloaded";
type StatusPeriod = {
  status: LoadStatus,
  startTime: number,
  endInclusive: number | null
}
type AlertsData = {
  statusHistory: StatusPeriod[],
  triggeredStatus: null | LoadStatus,
}

const LOAD_THRESHOLD = 1;

  // Likely something like DataSet<{x: number; y: number;} | null
export const computeAlertsData = (dataset: DataSet<any>, threshold: number): AlertsData => {
  const dataPoints = dataset.get() as {x: number, y: number}[];
  const statusHistory: StatusPeriod[] = [];
  let currentStatus = null;
  let lastTimestamp = null;
  let triggeredStatus: null | LoadStatus = null;

  dataPoints.forEach((point) => {
    const status = point.y > threshold ? "overloaded" : "ok";
    triggeredStatus = null;

    if (status !== currentStatus) {
      if (statusHistory.length > 0 && lastTimestamp) {
        statusHistory.at(-1).endInclusive = lastTimestamp;
      }

      statusHistory.push({
        status,
        startTime: point.x,
        endInclusive: null,
      })
      currentStatus = status;
      triggeredStatus = status;
    }

    lastTimestamp = point.x;
  })

  return {
    statusHistory,
    triggeredStatus,
  }
}

export const useCpuMonitor = async (interval = 10000) => {
  const dataset = new DataSet();
  const isMonitoring = ref(true);
  const alertsData = ref<AlertsData>({
    statusHistory: [] as StatusPeriod[],
    triggeredStatus: null
  })

  const toggleMonitoring = () => isMonitoring.value = !isMonitoring.value;

  const { data: cpuData, refresh, error } = await useFetch('/api/cpu-load')

  setInterval(() => {
    if (!isMonitoring.value) return;
    refresh();
  }, interval)

  // Runs whenever a new data point arrives
  watch(cpuData, (newData) => {
    dataset.add({
      id: newData.timestamp,
      x: newData.timestamp,
      y: newData.load,
      group: 1
    } as any)

    const idsToRemove = dataset.getIds({
      filter: (item: any) => moment().subtract(10, 'minutes').isAfter(item.x)
    });
    dataset.remove(idsToRemove);

    alertsData.value = computeAlertsData(dataset, LOAD_THRESHOLD);
  })

  return {
    alertsData,
    dataset,
    latestData: cpuData,
    error: error,
    refresh,
    isMonitoring,
    toggleMonitoring,
  }
}