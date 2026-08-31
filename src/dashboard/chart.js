import * as Plot from "./lib/observablehq-plot/observablehq-plot-0-6-17.js";

const LOW = 70;
const HIGH = 180;

function getHalfHourTicks(start, end) {
  const ticks = [];
  const t = new Date(start);
  t.setSeconds(0, 0);
  const rem = t.getMinutes() % 30;
  if (rem !== 0) t.setMinutes(t.getMinutes() + (30 - rem));
  for (let d = new Date(t); d <= end; d = new Date(d.getTime() + 30 * 60 * 1000)) {
    ticks.push(new Date(d));
  }
  return ticks;
}

function formatTick(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  if (hours === 0 && minutes === 0) {
    // midnight crossover — date instead of a repeated "12:00 AM"
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
    });
  }
  const period = hours < 12 ? "AM" : "PM";
  const h12 = hours % 12 || 12;
  return minutes === 0 ? `${h12} ${period}` : `${h12}:${String(minutes).padStart(2, "0")}`;
}

// entries: oldest-first array of { date: epoch ms, sgv: number }
export function renderChart(container, entries) {
  const data = entries.map((e) => ({ date: new Date(e.date), sgv: e.sgv }));
  const dates = data.map((d) => d.date);
  const values = data.map((d) => d.sgv);
  const domainStart = dates[0];
  const domainEnd = dates.at(-1);

  const plot = Plot.plot({
    width: container.clientWidth,
    height: container.clientHeight,
    marginLeft: 4,
    marginRight: 10,
    marginBottom: 36,
    style: {
      background: "transparent",
      fontFamily: "Inter, sans-serif",
      fontSize: 26,
      color: "#999999",
    },
    x: {
      type: "time",
      axis: "bottom",
      ticks: getHalfHourTicks(domainStart, domainEnd),
      tickFormat: formatTick,
      tickPadding: 8,
      tickSize: 8,
      stroke: "#cccccc",
      strokeWidth: 1.5,
      label: null,
    },
    y: {
      domain: [Math.min(...values, LOW), Math.max(...values, HIGH) + 10],
      axis: null,
    },
    marks: [
      Plot.rectY([{}], {
        x1: domainStart,
        x2: domainEnd,
        y1: LOW,
        y2: HIGH,
        fill: "#eceae4",
      }),
      Plot.ruleY([LOW, HIGH], { stroke: "#cccccc", strokeDasharray: "4,3" }),
      Plot.line(data, {
        x: "date",
        y: "sgv",
        curve: "linear",
        stroke: "#111111",
        strokeWidth: 6,
      }),
      Plot.dot(data.slice(-1), { x: "date", y: "sgv", fill: "#111111", r: 5 }),
    ],
  });

  container.replaceChildren(plot);
}
