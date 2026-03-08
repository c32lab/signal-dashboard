export interface BacktestConfig {
  weights: Record<string, number>
  description: string
}

export interface BacktestSummary {
  config: string
  total_trades: number
  signal_count?: number
  win_count?: number
  loss_count?: number
  win_rate_pct: number        // already_pct — display directly with %
  total_pnl_pct: number      // already_pct
  sharpe: number
  max_drawdown_pct: number   // already_pct
  long_count?: number
  long_wins?: number
  long_pnl_pct?: number
  short_count?: number
  short_wins?: number
  short_pnl_pct?: number
  regime?: string
}

export interface PnlCurvePoint {
  timestamp: string          // UTC ISO 8601
  cumulative_pnl_pct: number // already_pct
  regime?: string
}

export interface SymbolBacktest {
  config: string
  trades: number
  win_rate_pct: number        // already_pct
  total_pnl_pct: number      // already_pct
  sharpe: number
  max_drawdown_pct?: number  // already_pct
  long_count?: number
  long_pnl_pct?: number
  short_count?: number
  short_pnl_pct?: number
  regime?: string
}

export interface BacktestResult {
  generated_at: string
  data_range: {
    start: string
    end: string
  }
  configs: Record<string, BacktestConfig>
  summary: BacktestSummary[]
  by_symbol: Record<string, SymbolBacktest[]>
  pnl_curve: Record<string, PnlCurvePoint[]>
  by_regime?: Record<string, BacktestSummary[]>
}

export interface BacktestResponse {
  results: BacktestResult[]
}

// Parameter matrix result from /api/backtest/parameter-matrix
export interface ParamMatrixCell {
  min_confidence: number
  technical_weight: number
  derivatives_weight: number
  win_rate_pct: number
  sharpe: number
  total_pnl_pct: number
  max_drawdown_pct: number
  total_trades: number
}

export interface ParamMatrixResponse {
  generated_at: string
  data_range: { start: string; end: string }
  swept_params: string[]
  results: ParamMatrixCell[]
}

// Walk-forward result from /api/backtest/walk-forward
export interface WalkForwardWindow {
  window_start: string
  window_end: string
  train_end: string
  config: string
  win_rate_pct: number
  sharpe: number
  total_pnl_pct: number
  total_trades: number
}

export interface WalkForwardResponse {
  generated_at: string
  windows: WalkForwardWindow[]
}
