import express from "express";
import { env } from "./env.js";

const app = express();

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
  res.status(501).send("not implemented");
});

app.listen(env.PORT, () => console.log(`kindle-img listening on ${env.PORT}`));
