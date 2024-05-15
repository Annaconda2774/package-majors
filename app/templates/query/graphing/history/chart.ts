import { Chart } from '../setup-chart';

import type { ReshapedHistoricalData } from './util';

function sortLabels(data: ReshapedHistoricalData) {
  let labels = new Set();

  for (let byVersion of Object.values(data)) {
    for (let timeSeries of Object.values(byVersion)) {
      let keys = Object.keys(timeSeries);

      keys.forEach((key) => labels.add(key));
    }
  }

  return [...labels].sort();
}

function datasetsFor(data: ReshapedHistoricalData) {
  let result = [];

  for (let [packageName, byVersion] of Object.entries(data)) {
    for (let [version, byTime] of Object.entries(byVersion)) {
      result.push({
        label: `${packageName} @ ${version}.x`,
        data: Object.entries(byTime).map(([week, count]) => {
          return { week, count };
        }),
      });
    }
  }

  return result;
}

export function createChart(element: HTMLCanvasElement, data: ReshapedHistoricalData) {
  return new Chart(element, {
    type: 'line',
    data: {
      labels: sortLabels(data),
      datasets: datasetsFor(data),
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        tooltip: {
          enabled: true,
          //usePointStyle: true,
          //labelPointStyle: function (/* context */) {
          //  return {
          //    pointStyle: 'triangle',
          //    rotation: 0,
          //  };
          //},
          position: 'nearest',
          padding: 8,
          bodyFont: {
            size: 16,
          },
          callbacks: {},
        },
        legend: {
          labels: {
            //color: textColor,
            font: {
              size: 16,
            },
          },
        },
      },
      parsing: {
        xAxisKey: 'week',
        yAxisKey: 'count',
      },
      transitions: {
        show: {
          animations: {
            y: {
              from: 0,
            },
          },
        },
      },
    },
  });
}
