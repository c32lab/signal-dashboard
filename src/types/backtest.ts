export interface BacktestConfig {
  weights: Record<string, number>
  description: string
}

export interface BacktestSummary {
  config: string
  total_trades: number
  win_rate: number           // already_pct — display directly with %
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
  win_rate: number           // already_pct
  total_pnl_pct: number      // already_pct
  sharpe: number
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
