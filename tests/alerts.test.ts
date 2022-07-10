import { beforeEach, describe, expect, test } from 'vitest'
import { setup } from '@nuxt/test-utils-edge'
import { DataSet, moment } from "vis-timeline/standalone";
import { computeAlertsData } from '../composables/useCpuMonitor';

// const makeDataPoint: (seconds: number, load: number) => {x: number, y: number} = ;

const EMPTY_DATA = [];

const NO_ALERT_DATA = [
  {x: 0, y: 0.25},
  {x: 30, y: 0.25},
  {x: 60, y: 0.25},
  {x: 90, y: 0.25}
]

const TRIGGER_ALERT_DATA = [
  {x: 0, y: 0.25},
  {x: 30, y: 0.25},
  {x: 60, y: 0.25},
  {x: 90, y: 2}
]

const FLIP_FLOP_ALERT_DATA = [
  {x: 0, y: 0.25},
  {x: 30, y: 1.25},
  {x: 60, y: 0.25},
  {x: 90, y: 1.25},
  {x: 120, y: 0.25}
]

describe('computeAlertsData', async () => {
  const setupTest: (testData: {x: number, y: number}[]) => DataSet<any> = (testData) => {
    const dataSet = new DataSet();
    testData.forEach((point) => {
      const utcStamp = moment().add(point.x, 'seconds').valueOf();
      dataSet.add({ id: utcStamp, x: utcStamp, y: point.y } as any);
    });
    return dataSet;
  }

  test('empty status history if data is empty', () => {
    const dataSet = setupTest(EMPTY_DATA)
    const computedAlerts = computeAlertsData(dataSet, 1.0);
    expect(computedAlerts.statusHistory.length).toEqual(0);
    expect(computedAlerts.triggeredStatus).toEqual(null);
  })
  test('no alert status if nothing below threshold', () => {
    const dataSet = setupTest(NO_ALERT_DATA)
    const computedAlerts = computeAlertsData(dataSet, 1.0);
    expect(computedAlerts.statusHistory.length).toEqual(1);
    expect(computedAlerts.statusHistory[0].status).toEqual('ok');
    expect(computedAlerts.triggeredStatus).toEqual(null);
  })

  test('trigger alert if latest reading is above threshold', () => {
    const dataSet = setupTest(TRIGGER_ALERT_DATA)
    const computedAlerts = computeAlertsData(dataSet, 1.0);
    expect(computedAlerts.statusHistory.length).toEqual(2);
    expect(computedAlerts.statusHistory[0].status).toEqual('ok');
    expect(computedAlerts.statusHistory.at(-1).status).toEqual('overloaded');
    expect(computedAlerts.triggeredStatus).toEqual('overloaded');
  })

  test('saves inclusive duration of statuses', () => {
    const dataSet = setupTest(TRIGGER_ALERT_DATA)
    const computedAlerts = computeAlertsData(dataSet, 1.0);
    expect(computedAlerts.statusHistory[0].status).toEqual('ok');

    const okStatusDuration = computedAlerts.statusHistory[0].endInclusive - computedAlerts.statusHistory[0].startTime;
    expect(okStatusDuration).toEqual(60000);
  });

  test('counts the number of flips between status', () => {
    const dataSet = setupTest(FLIP_FLOP_ALERT_DATA)
    const computedAlerts = computeAlertsData(dataSet, 1.0);
    expect(computedAlerts.statusHistory.length).toEqual(5);
    expect(computedAlerts.statusHistory.at(-1).status).toEqual('ok');
  })
})
