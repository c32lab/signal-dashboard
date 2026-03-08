// GET /api/backtest/parameter-matrix
export interface ParamMatrixResponse {
  symbols: Record<string, ParamMatrixSymbol>
}

export interface ParamMatrixSymbol {
  total_configs: number
  results: ParamMatrixEntry[]
}

export interface ParamMatrixEntry {
  params: Record<string, number>
  trades: number
  wins: number
  win_rate: number
  pnl: number
  return_pct: number
  sharpe: number
}

// GET /api/backtest/walk-forward
export interface WalkForwardResponse {
  generated: string
  config: WalkForwardConfig
  symbols: WalkForwardSymbol[]
}

export interface WalkForwardConfig {
  days: number
  interval: string
  train_days: number
  test_days: number
  roll_days: number
  top_k: number
  starting_balance: number
  param_grid: Record<string, number[]>
}

export interface WalkForwardSymbol {
  symbol: string
  total_bars: number
  data_period: string
  num_windows: number
  windows: WalkForwardWindow[]
}

export interface WalkForwardWindow {
  window: number
  train_period: string
  test_period: string
  train_bars: number
  test_bars: number
  configs: WalkForwardWindowConfig[]
}

export interface WalkForwardWindowConfig {
  rank: number
  params: Record<string, number>
  in_sample: WalkForwardMetrics
  oos: WalkForwardMetrics
  degradation: number
}

export interface WalkForwardMetrics {
  sharpe: number
  win_rate: number
  return_pct: number
  trades: number
  pnl: number
}
