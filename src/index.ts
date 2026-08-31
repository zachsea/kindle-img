import express from "express";
import { env } from "./env.js";
import { renderDashboard } from "./render.js";
import { LRUCache } from "lru-cache/raw";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

export const dashboardCache = new LRUCache<string, Buffer>({
  max: 1, // only ever caching one thing
  ttl: 30_000,
  fetchMethod: () => renderDashboard(),
});

// trmnl-koreader request
app.get("/api/display", (req, res) => {
  const base = `${req.protocol}://${req.get("host")}`;
  res.json({
    image_url: `${base}/dash.png`,
    refresh_rate: env.REFRESH_RATE_SECONDS,
    filename: "dash.png",
  });
});

// serve the dashboard image
app.get("/dash.png", async (_req, res) => {
  try {
    const png = await dashboardCache.fetch("dashboard");
    res.set("Content-Type", "image/png");
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).send("render failed");
  }
});

// -- eventually we should decouple the page rendering to a separate service if it gets complex enough --

// proxy Nightscout entries requests
app.get("/api/nightscout/entries", async (req, res) => {
  const hours = Number(req.query.hours ?? 3);
  const since = Date.now() - hours * 60 * 60 * 1000;

  const url = new URL("/api/v1/entries.json", process.env.NIGHTSCOUT_URL);
  url.searchParams.set("find[date][$gte]", since.toString());
  url.searchParams.set("count", "500"); // safety cap, won't be hit at normal 5-min intervals

  const nsRes = await fetch(url, {
    headers: process.env.NIGHTSCOUT_API_SECRET ? { "API-SECRET": process.env.NIGHTSCOUT_API_SECRET } : {},
  });
  res.json(await nsRes.json());
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distStatic = path.join(__dirname, "dashboard");
const srcStatic = path.join(process.cwd(), "src", "dashboard");
let staticDir: string | null = null;
if (fs.existsSync(distStatic)) staticDir = distStatic;
else if (fs.existsSync(srcStatic)) staticDir = srcStatic;
if (staticDir) {
  app.use(express.static(staticDir));
}

app.listen(env.PORT, () => console.log(`kindle-img listening on ${env.PORT}`));
