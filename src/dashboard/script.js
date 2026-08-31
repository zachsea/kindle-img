// __RENDER_READY__ indicates to playwright that the page has finished rendering and is ready to be screenshotted
import { renderChart } from "./chart.js";

const TREND_ARROWS = {
  DoubleUp: "double-up.svg",
  SingleUp: "up.svg",
  FortyFiveUp: "up-right.svg",
  Flat: "right.svg",
  FortyFiveDown: "down-right.svg",
  SingleDown: "down.svg",
  DoubleDown: "double-down.svg",
};

async function main() {
  const res = await fetch("/api/nightscout/entries?hours=3");
  const entries = await res.json(); // newest first

  const [latest, previous] = entries;
  document.getElementById("value").textContent = latest.sgv;
  const arrowEl = document.getElementById("arrow");
  const icon = TREND_ARROWS[latest.direction];
  if (icon) {
    arrowEl.innerHTML = `<img src="./icons/${icon}" alt="${latest.direction}" />`;
  } else {
    arrowEl.textContent = "";
  }
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
