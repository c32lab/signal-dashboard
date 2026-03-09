# API Integration Guide

Complete mapping of every API endpoint the Signal Dashboard calls, including the SWR hook, TypeScript response type, and which page/component consumes the data.

## Signal API (`/api` → `localhost:18810`)

| Endpoint | Method | Response Type | SWR Hook | Refresh | Page / Component |
|---|---|---|---|---|---|
| `/api/health` | GET | `HealthResponse` | `useHealth()` | 30s | Dashboard (HealthSummary), SystemHealthPage, SymbolsProvider (reads `active_symbols`) |
| `/api/overview` | GET | `Overview` | `useOverview()` | 30s | Dashboard (KPIPanel, SignalCards) |
| `/api/decisions` | GET | `DecisionsResponse` | `useDecisions(params?)` | 30s | TraderHistory (DecisionTable), SignalTimeline (via useTimelineData) |
| `/api/decisions` | GET | `DecisionsResponse` | `useRecentDecisions(minutes)` | 15s | Dashboard (LiveSignalFeed) — uses `limit=50` + `from` param |
| `/api/decisions/:id` | GET | `Decision` | — (direct api call) | — | Decision detail views |
| `/api/signals/latest` | GET | `{ signals: Signal[] }` | `useSignalsLatest()` | 30s | Dashboard (LiveSignalFeed) |
| `/api/performance` | GET | `PerformanceResponse` | `usePerformance()` | 30s | Dashboard (AccuracyKPI) |
| `/api/confidence` | GET | `ConfidenceData` | `useConfidence()` | 30s | QualityTracker (ConfidenceDistribution) |
| `/api/signal_quality?hours=N` | GET | `SignalQualityResponse` | `useSignalQuality(hours)` | 30s | QualityTracker (SignalQualityTable) — default `hours=6` |
| `/api/accuracy/trend?hours=24` | GET | `{ trend: AccuracyTrendItem[] }` | `useAccuracyTrend()` | 60s | QualityTracker (AccuracyTrend chart) |
| `/api/accuracy/trend?hours=336` | GET | `{ trend: AccuracyTrendItem[] }` | `useAccuracyTrendWeekly()` | 60s | QualityTracker (weekly trend toggle) |
| `/api/accuracy` | GET | `AccuracyResponse` | `useAccuracy()` | 30s | QualityTracker (AccuracyLeaderboard) |
| `/api/accuracy/summary` | GET | `AccuracySummaryResponse` | `useAccuracySummary()` | 60s | Dashboard (AccuracyKPI) |
| `/api/backtest` | GET | `{ results: unknown[] }` | `useBacktest()` | 60s | BacktestDashboard (BacktestResultView, PnlCompareChart) — normalized via `backtestNormalizer` |
| `/api/combiner_weights` | GET | `CombinerWeightsResponse` | `useCombinerWeights()` | 30s | Dashboard (CombinerWeights, CombinerWeightsChart) |
| `/api/bias` | GET | `BiasResponse` | `useBias()` | 30s | SystemHealthPage (bias monitoring) |
| `/api/collector-health` | GET | `CollectorHealthResponse` | `useCollectorHealth()` | 30s | SystemHealthPage (collector status) |
| `/api/trading/summary` | GET | `TradingSummary` | `useTradingSummary()` | 10s | TradingDashboard (BalanceCards, PositionsList, PnlCurve, TradeTable), Dashboard (TradingStatus) |
| `/api/backtest/parameter-matrix` | GET | `ParamMatrixResponse` | `useParamMatrix()` | 60s | BacktestDashboard (parameter heatmap) |
| `/api/backtest/walk-forward` | GET | `WalkForwardResponse` | `useWalkForward()` | 60s | BacktestDashboard (WalkForwardChart) |

## Data-Eng API (`/data-api` → `localhost:8081`, prefix stripped)

| Endpoint | Method | Response Type | Called From | Page / Component |
|---|---|---|---|---|
| `/data-api/api/price-ranges` | GET | `{ symbol, current, p5, p95 }[]` | `dataValidation.ts` (cached 5min) | Used internally for price validation across all pages |
| `/data-api/api/price-ranges/validate` | GET | `{ valid: boolean, reason?: string }` | `dataValidation.ts` | Price validation (query: `symbol`, `price`) |

## SWR Configuration

Global SWR config (set in `App.tsx`):

```
errorRetryCount:    3
errorRetryInterval: 5000ms
shouldRetryOnError: true
```

All hooks use `refreshInterval` for automatic polling. No hooks use `revalidateOnFocus: false` — all revalidate on window focus by default.

## TypeScript Types Reference

### Core Types (`src/types/index.ts`)

| Type | Key Fields |
|---|---|
| `Decision` | `id`, `timestamp`, `symbol`, `action`, `direction`, `confidence` (0–1), `decision_type`, `combined_score`, `reasoning`, `price_at_decision` |
| `DecisionsResponse` | `decisions: Decision[]`, `total`, `limit`, `offset` |
| `Overview` | `total_decisions`, `recent_1h`, `action_distribution`, `symbol_distribution`, `type_distribution` |
| `HealthResponse` | `status`, `uptime_seconds`, `version`, `total_decisions`, `active_symbols`, `disabled_symbols`, `decision_rate_per_hour`, `duplicate_ratio`, `accuracy_trend`, `bias_alerts`, `last_scan` |
| `PerformanceResponse` | `by_symbol: PerformanceSymbol[]`, `overall: { total, correct, accuracy_pct, avg_pnl_pct }` |
| `AccuracyResponse` | `timestamp`, `windows: { '6h', '12h', '24h': AccuracyWindowData }` |
| `AccuracyWindowData` | `total_actionable`, `accuracy: { '1h_pct', '4h_pct' }`, `by_symbol`, `dampened_symbols` |
| `AccuracySummaryResponse` | `windows: Record<string, AccuracySummaryWindow>` |
| `SignalQualityResponse` | `window_hours`, `total_decisions`, `actionable`, `actionable_rate_pct`, `by_type`, `by_symbol`, `avg_confidence` |
| `ConfidenceData` | `confidence_buckets: ConfidenceBucket[]` |
| `BiasResponse` | `timestamp`, `window_hours`, `collectors: Record<string, BiasCollector>`, `overall` |
| `CollectorHealthResponse` | `collectors: CollectorHealthItem[]` |
| `CombinerWeightsResponse` | `weights: Record<string, number>` |
| `DecisionFilters` | `limit`, `offset`, `symbol`, `type`, `action`, `direction`, `from`, `to` |

### Backtest Types (`src/types/backtest.ts`)

| Type | Key Fields |
|---|---|
| `BacktestResult` | `generated_at`, `data_range`, `configs`, `summary: BacktestSummary[]`, `by_symbol`, `pnl_curve`, `by_regime` |
| `BacktestSummary` | `config`, `total_trades`, `win_rate_pct`, `total_pnl_pct`, `sharpe`, `max_drawdown_pct` |
| `PnlCurvePoint` | `timestamp`, `cumulative_pnl_pct`, `regime` |
| `ParamMatrixCell` | `min_confidence`, `technical_weight`, `derivatives_weight`, `win_rate_pct`, `sharpe`, `total_pnl_pct`, `max_drawdown_pct`, `total_trades` |
| `WalkForwardWindow` | `window_start`, `window_end`, `train_end`, `config`, `win_rate_pct`, `sharpe`, `total_pnl_pct`, `total_trades` |

### Trading Types (`src/types/trading.ts`)

| Type | Key Fields |
|---|---|
| `TradingBalance` | `total_usdt`, `unrealized_pnl`, `available` |
| `TradingPosition` | `symbol`, `side`, `size`, `entry_price`, `unrealized_pnl`, `leverage` |
| `TradingTrade` | `id`, `timestamp`, `symbol`, `side`, `entry_price`, `exit_price`, `size`, `confidence` (0–1), `pnl_usdt`, `status` |
| `TradingSummary` | `balance`, `positions`, `recent_trades` |

### Parameter Matrix Types (`src/types/paramMatrix.ts`)

| Type | Key Fields |
|---|---|
| `ParamMatrixResponse` | `symbols: Record<string, ParamMatrixSymbol>` |
| `ParamMatrixEntry` | `params`, `trades`, `wins`, `win_rate`, `pnl`, `return_pct`, `sharpe` |
| `WalkForwardResponse` | `generated`, `config: WalkForwardConfig`, `symbols: WalkForwardSymbol[]` |
| `WalkForwardSymbol` | `symbol`, `num_windows`, `windows: WalkForwardWindow[]` |
