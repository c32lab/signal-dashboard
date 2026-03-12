import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3080;

function toUrl(raw, fallback) {
  const val = raw || fallback;
  return val.startsWith("http") ? val : `http://${val}`;
}

const signalApi = toUrl(process.env.SIGNAL_API_UPSTREAM, "localhost:18810");
const predictApi = toUrl(process.env.PREDICT_API_UPSTREAM, "localhost:18801");
const dataApi = toUrl(process.env.DATA_API_UPSTREAM, "localhost:8081");

const app = express();

// Signal API — /api/ forwards directly (no rewrite)
app.use(
  "/api",
  createProxyMiddleware({ target: signalApi, changeOrigin: true }),
);

// Predict API — /predict-api/ strips prefix
app.use(
  "/predict-api",
  createProxyMiddleware({
    target: predictApi,
    changeOrigin: true,
    pathRewrite: { "^/predict-api": "" },
  }),
);

// Data API — /data-api/ strips prefix
app.use(
  "/data-api",
  createProxyMiddleware({
    target: dataApi,
    changeOrigin: true,
    pathRewrite: { "^/data-api": "" },
  }),
);

const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`signal-dashboard listening on :${PORT}`);
  console.log(`Signal API -> ${signalApi}`);
  console.log(`Predict API -> ${predictApi}`);
  console.log(`Data API -> ${dataApi}`);
});
