// GET /api/backtest/parameter-matrix
export interface ParamMatrixResult {
  sweep_id: string
  generated_at: string
  dimensions: string[] // e.g. ["min_confidence", "technical_weight", "derivatives_weight"]
  results: ParamMatrixEntry[]
}

export interface ParamMatrixEntry {
  params: Record<string, number> // e.g. { min_confidence: 0.3, technical_weight: 0.25, ... }
  metrics: {
    sharpe: number
    win_rate_pct: number
    total_pnl_pct: number
    max_drawdown_pct: number
    total_trades: number
  }
}

// GET /api/backtest/walk-forward
export interface WalkForwardResult {
  windows: WalkForwardWindow[]
  overall: { sharpe: number; win_rate_pct: number; total_pnl_pct: number }
}

export interface WalkForwardWindow {
  train_start: string
  train_end: string
  test_start: string
  test_end: string
  best_params: Record<string, number>
  in_sample: { sharpe: number; win_rate_pct: number; total_pnl_pct: number }
  out_of_sample: { sharpe: number; win_rate_pct: number; total_pnl_pct: number }
}
