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
  win_rate_pct: number
  total_pnl_pct: number      // already_pct
  sharpe: number
  max_drawdown_pct: number   // already_pct
}

export interface PnlCurvePoint {
  timestamp: string          // UTC ISO 8601
  cumulative_pnl_pct: number // already_pct
}

export interface SymbolBacktest {
  config: string
  trades: number
  win_rate_pct: number            // already_pct
  total_pnl_pct: number      // already_pct
  sharpe: number
  max_drawdown_pct?: number  // already_pct
  long_count?: number
  long_pnl_pct?: number
  short_count?: number
  short_pnl_pct?: number
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
}

export interface BacktestResponse {
  results: BacktestResult[]
}
