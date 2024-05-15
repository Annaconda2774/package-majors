import Color from 'color';

import { Chart, colors } from '../setup-chart';

import type { ReshapedHistoricalData } from './util';

const formatter = new Intl.NumberFormat('en-US');

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

const increments = [0.1, 0.2, 0.3, 0.4, 0.5];

function datasetsFor(data: ReshapedHistoricalData) {
  let result = [];
  let packageNames = Object.keys(data);
  let numPackages = packageNames.length;

  function colorFor(packageName: string, version: string) {
    if (numPackages === 1) {
      let versions = Object.keys(data[packageName]);
      let i = versions.indexOf(version);
      let chosen = colors[i % colors.length];

      return new Color(chosen).rgb().string();
    }

    let i = packageNames.indexOf(packageName);
    let baseColor = colors[i % colors.length];

    let color = new Color(baseColor);

    let rand1 = Math.random() * increments.length;
    let rand2 = Math.random() * increments.length;
    let inc1 = increments[Math.floor(rand1) % increments.length];
    let inc2 = increments[Math.floor(rand2) % increments.length];

    color = rand1 < 2.5 ? color.saturate(inc1) : color.desaturate(inc1);
    color = rand2 < 2.5 ? color.lighten(inc2) : color.darken(inc2);

    return color.rgb().string();
  }

  for (let [packageName, byVersion] of Object.entries(data)) {
    for (let [version, byTime] of Object.entries(byVersion)) {
      let color = colorFor(packageName, version);

      result.push({
        label: `${packageName} @ ${version}.x`,
        backgroundColor: color,
        pointHoverBorderWidth: 5,
        hoverBorderWidth: 7,
        borderColor: color,
        data: Object.entries(byTime).map(([week, count]) => {
          return { week, count };
        }),
      });
    }
  }

  return result;
}

// Use this:
// https://chartjs-plugin-datalabels.netlify.app/samples/scriptable/interactions.html
export function createChart(
  element: HTMLCanvasElement,
  data: ReshapedHistoricalData,
  updateTooltip: (context: IDC) => void
) {
  return new Chart(element, {
    type: 'line',
    data: {
      labels: sortLabels(data),
      datasets: datasetsFor(data),
    },
    options: {
      clip: 8,
      maintainAspectRatio: false,
      responsive: true,
      interaction: {
        intersect: false,
        mode: 'dataset',
      },
      elements: {
        line: {
          borderWidth: 3,
          hoverBorderWidth: 6,
        },
      },
      scales: {},
      plugins: {
        //colors: {
        //  forceOverride: true,
        //},
        tooltip: {
          external: updateTooltip,
          enabled: false,
          // ignored
          mode: 'index',
          intersect: false,
          position: 'nearest',
          padding: 8,
          bodyFont: {
            size: 16,
          },
          callbacks: {
            footer: (items) => {
              let sum = 0;

              items.forEach((item) => {
                sum += item.parsed.y;
              });

              return `Total: ${formatter.format(sum)}`;
            },
          },
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
