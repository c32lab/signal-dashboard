export interface Decision {
  id: string | number
  timestamp: string
  symbol: string
  action: string
  direction: string
  confidence: number
  decision_type: string
  combined_score: number
  reasoning: string
  price_at_decision: number
  raw_json?: string
}

export interface DecisionsResponse {
  decisions: Decision[]
  total: number
  limit: number
  offset: number
}

export interface Signal {
  id: string
  timestamp: string
  symbol: string
  action: string
  direction: string
  confidence: number
  decision_type: string
  combined_score: number
  reasoning: string
  price_at_decision: number
  raw_json?: string
}

export interface Overview {
  total_decisions: number
  recent_1h: Record<string, number>
  action_distribution: Record<string, number>
  symbol_distribution: Record<string, number>
  type_distribution: Record<string, number>
}

export interface HealthResponse {
  status: string
  active_symbols?: string[]
  disabled_symbols?: string[]
  decision_rate_per_hour?: number
  duplicate_ratio?: number
  accuracy_trend?: AccuracyTrendItem[]
  bias_alerts?: unknown[]
}

export interface PerformanceSymbol {
  symbol: string
  total: number
  correct: number
  accuracy_pct: number
  avg_pnl_pct: number
}

export interface PerformanceResponse {
  by_symbol: PerformanceSymbol[]
  overall: {
    total: number
    correct: number
    accuracy_pct: number
    avg_pnl_pct: number
  }
}

export interface AccuracyTrendItem {
  hour: string
  symbol: string
  total: number
  correct: number
  accuracy_pct: number
}

export interface SignalQualitySymbol {
  symbol: string
  total_signals: number
  correct: number
  accuracy_pct: number
  avg_pnl_pct: number
  best_pnl: number
  worst_pnl: number
}

export interface SignalQualityResponse {
  by_symbol: SignalQualitySymbol[]
}

export interface AccuracyWindowData {
  total_actionable: number
  accuracy: {
    '1h_pct': number
    '4h_pct': number
  }
  by_symbol: Record<string, {
    total: number
    accuracy_1h_pct: number
    accuracy_4h_pct: number
  }>
  dampened_symbols: string[]
}

export interface AccuracyResponse {
  timestamp: string
  windows: {
    '6h': AccuracyWindowData
    '12h': AccuracyWindowData
    '24h': AccuracyWindowData
  }
  _meta?: Record<string, string>
}

export interface BiasCollector {
  total_signals: number
  long_count: number
  short_count: number
  neutral_count: number
  bias_score: number
}

export interface BiasResponse {
  timestamp: string
  window_hours: number
  collectors: Record<string, BiasCollector>
  overall: {
    long_pct: number
    short_pct: number
    neutral_pct: number
    bias_score: number
  }
}

export interface CollectorHealthItem {
  name: string
  error_count: number
  is_disabled: boolean
  disabled_remaining_secs: number
  is_degraded: boolean
}

export interface CollectorHealthResponse {
  collectors: CollectorHealthItem[]
}

export interface CombinerWeightsResponse {
  weights: Record<string, number>
}

export type ConfidenceData = Record<string, unknown>
export type BacktestData = Record<string, unknown>

export interface DecisionFilters {
  limit?: number
  offset?: number
  symbol?: string
  type?: string
  action?: string
  direction?: string
  from?: string
  to?: string
}
