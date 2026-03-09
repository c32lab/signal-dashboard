# Grafana API Monitoring Dashboard

## Import

1. Open Grafana at `http://localhost:3000`
2. Go to **Dashboards** → **New** → **Import**
3. Click **Upload dashboard JSON file** and select `api-monitoring.json`
4. Select your Prometheus datasource (must have uid `prometheus` or update the JSON)
5. Click **Import**

## Panels

| Row | Panel | Metric |
|-----|-------|--------|
| Signal Engine Overview | Decisions Produced (rate) | `rate(signal_decisions_produced_total[5m])` |
| Signal Engine Overview | Scan Duration p50/p95/p99 | `histogram_quantile` on `signal_scan_duration_seconds_bucket` |
| Signal Engine Overview | Collector Signal Count | `signal_collector_signals_count` by collector |
| API Health | Signal API Status | `up{job="signal"}` |
| API Health | Predict API Status | `up{job="predict"}` |
| System Metrics | CPU Usage | `node_cpu_seconds_total` (requires node_exporter) |
| System Metrics | Memory Usage | `node_memory_*` (requires node_exporter) |
| System Metrics | Process Uptime | `process_uptime_seconds` |

## Prerequisites

- Prometheus scraping Signal API `/metrics` endpoint (job: `signal`)
- Prometheus scraping Predict API (job: `predict`) — at minimum for `up` metric
- Optional: `node_exporter` for system metrics (CPU, memory)

## Dashboard Settings

- Auto-refresh: 30s
- Default time range: 6h
