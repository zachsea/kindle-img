// __RENDER_READY__ indicates to playwright that the page has finished rendering and is ready to be screenshotted
import { renderChart } from "./chart.js";

const TREND_ARROWS = {
  DoubleUp: "⇈",
  SingleUp: "↑",
  FortyFiveUp: "↗",
  Flat: "→",
  FortyFiveDown: "↘",
  SingleDown: "↓",
  DoubleDown: "⇊",
};

async function main() {
  const res = await fetch("/api/nightscout/entries?hours=3");
  const entries = await res.json(); // newest first

  const [latest, previous] = entries;
  document.getElementById("value").textContent = latest.sgv;
  document.getElementById("arrow").textContent = TREND_ARROWS[latest.direction] ?? "";
  const delta = previous ? latest.sgv - previous.sgv : 0;
  document.getElementById("delta").textContent = `${delta > 0 ? "+" : ""}${delta} mg/dL`;
  document.getElementById("timestamp").textContent = `${Math.round((Date.now() - latest.date) / 60000)} min ago`;

  renderChart(document.getElementById("chart"), entries.slice().reverse());
  window.__RENDER_READY__ = true;
}

main().catch((err) => {
  document.body.textContent = "render failed: " + err.message;
  window.__RENDER_READY__ = true;
});
