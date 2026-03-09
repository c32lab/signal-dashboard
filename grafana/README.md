# Grafana API Monitoring Dashboard

## Import

1. Open Grafana at `http://localhost:3000`
2. Go to **Dashboards** → **New** → **Import**
3. Click **Upload dashboard JSON file** and select `api-monitoring.json`
4. Select your Prometheus datasource (must have uid `prometheus` or update the JSON)
5. Click **Import**

## Prometheus Scrape Targets

| Job | Endpoint | Metrics |
|-----|----------|---------|
| `amani-signal` | `host.docker.internal:18810/metrics` | `http_requests_total`, `signal_scan_duration_seconds`, `signal_decisions_produced_total`, `signal_collector_signals_count` |
| `amani-predict` | `host.docker.internal:18820/metrics` | `http_requests_total`, `http_request_duration_seconds`, `predict_predictions_total`, `predict_predictions_active`, `predict_validations_total`, `predict_accuracy_1d_pct`, `predict_events_total` |
| `udl` | `host.docker.internal:8081/metrics` | `udl_api_up`, `udl_db_size_bytes`, `udl_table_rows`, `udl_ohlcv_freshness_seconds`, `udl_funding_rate_freshness_seconds`, `udl_derivatives_freshness_seconds`, `udl_news_freshness_seconds` |

## Panels

| Row | Panel | Type | Metric |
|-----|-------|------|--------|
| HTTP API Monitoring | API QPS | timeseries | `rate(http_requests_total{job="amani-signal"}[5m])` by handler |
| HTTP API Monitoring | Total Requests (24h) | stat | `increase(http_requests_total{job="amani-signal"}[24h])` |
| HTTP API Monitoring | Requests by Endpoint | piechart | `increase(http_requests_total{job="amani-signal"}[1h])` by handler |
| HTTP API Monitoring | Error Rate | stat | 4xx+5xx / total * 100 |
| HTTP API Monitoring | Requests by Status Code | table | `http_requests_total{job="amani-signal"}` by handler, status |
| Predict API Monitoring | Predict API QPS | timeseries | `rate(http_requests_total{job="amani-predict"}[5m])` by path |
| Predict API Monitoring | Predict API Latency (p50/p95) | timeseries | `histogram_quantile` on `http_request_duration_seconds_bucket` |
| Predict API Monitoring | Predict Error Rate | stat | 4xx+5xx / total * 100 |
| Predict API Monitoring | Active Predictions | stat | `predict_predictions_active` |
| Predict API Monitoring | Total Predictions | stat | `predict_predictions_total` |
| Predict API Monitoring | 1d Accuracy | gauge | `predict_accuracy_1d_pct` (green ≥60, yellow 50-60, red <50) |
| Predict API Monitoring | Total Validations | stat | `predict_validations_total` |
| Predict API Monitoring | Knowledge Base Events | stat | `predict_events_total` |
| Signal Engine | Decisions Produced Rate | stat | `rate(signal_decisions_produced_total[5m])` |
| Signal Engine | Scan Duration p50/p95/p99 | timeseries | `histogram_quantile` on `signal_scan_duration_seconds_bucket` |
| Signal Engine | Collector Signal Count | gauge | `signal_collector_signals_count` |
| Data Pipeline Health | UDL API Up | stat | `udl_api_up` |
| Data Pipeline Health | DB Size (MB) | gauge | `udl_db_size_bytes / 1024 / 1024` |
| Data Pipeline Health | Table Row Counts | table | `udl_table_rows` by `table` label |
| Data Pipeline Health | Data Freshness | timeseries | `udl_ohlcv_freshness_seconds`, `udl_funding_rate_freshness_seconds`, `udl_derivatives_freshness_seconds`, `udl_news_freshness_seconds` |
| Service Status | Signal API Up | stat | `up{job="amani-signal"}` |
| Service Status | UDL API Up | stat | `up{job="udl"}` |
| Service Status | Predict API Up | stat | `up{job="amani-predict"}` |

## Dashboard Settings

- Auto-refresh: 30s
- Default time range: 6h
- Theme: dark
