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
| `amani-signal` | `host.docker.internal:18810/metrics` | `signal_scan_duration_seconds`, `signal_decisions_produced_total`, `signal_collector_signals_count` |
| `udl` | `host.docker.internal:8081/metrics` | `udl_api_up`, `udl_db_size_bytes`, `udl_table_rows`, `udl_ohlcv_freshness_seconds`, `udl_funding_rate_freshness_seconds`, `udl_derivatives_freshness_seconds`, `udl_news_freshness_seconds` |

## Panels

| Row | Panel | Type | Metric |
|-----|-------|------|--------|
| Signal Engine | Decisions Produced Rate | stat | `rate(signal_decisions_produced_total[5m])` |
| Signal Engine | Scan Duration p50/p95/p99 | timeseries | `histogram_quantile` on `signal_scan_duration_seconds_bucket` |
| Signal Engine | Collector Signal Count | gauge | `signal_collector_signals_count` |
| Data Pipeline Health | UDL API Up | stat | `udl_api_up` |
| Data Pipeline Health | DB Size (MB) | gauge | `udl_db_size_bytes / 1024 / 1024` |
| Data Pipeline Health | Table Row Counts | table | `udl_table_rows` by `table` label |
| Data Pipeline Health | Data Freshness | timeseries | `udl_ohlcv_freshness_seconds`, `udl_funding_rate_freshness_seconds`, `udl_derivatives_freshness_seconds`, `udl_news_freshness_seconds` |
| Service Status | Signal API Up | stat | `up{job="amani-signal"}` |
| Service Status | UDL API Up | stat | `up{job="udl"}` |
| Service Status | Predict Metrics Pending | text | Placeholder — needs `prometheus_client` middleware |

## Dashboard Settings

- Auto-refresh: 30s
- Default time range: 6h
- Theme: dark
