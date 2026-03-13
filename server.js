import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8081;

function toUrl(raw, fallback) {
  const val = raw || fallback;
  return val.startsWith("http") ? val : `http://${val}`;
}

const signalApi = toUrl(process.env.SIGNAL_API_UPSTREAM, "localhost:8090");
const predictApi = toUrl(process.env.PREDICT_API_UPSTREAM, "localhost:8092");
const dataApi = toUrl(process.env.DATA_API_UPSTREAM, "localhost:8081");

const app = express();

// Signal API — pathFilter preserves /api prefix
app.use(
  createProxyMiddleware({
    target: signalApi,
    changeOrigin: true,
    pathFilter: "/api",
  }),
);

// Predict API — pathFilter + pathRewrite strips /predict-api
app.use(
  createProxyMiddleware({
    target: predictApi,
    changeOrigin: true,
    pathFilter: "/predict-api",
    pathRewrite: { "^/predict-api": "" },
  }),
);

// Data API — pathFilter + pathRewrite strips /data-api
app.use(
  createProxyMiddleware({
    target: dataApi,
    changeOrigin: true,
    pathFilter: "/data-api",
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
