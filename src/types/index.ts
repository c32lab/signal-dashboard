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
  uptime_seconds?: number
  version?: string
  total_decisions?: number
  active_symbols?: string[]
  disabled_symbols?: string[]
  decision_rate_per_hour?: number
  duplicate_ratio?: number
  accuracy_trend?: AccuracyTrendItem[]
  bias_alerts?: Array<{ collector: string; bias_score: number; alert: string }>
  last_scan?: string
}

export interface BiasAlert {
  collector: string
  alert: string
  bias_score: number
}

export interface StatusResponse {
  bias_alerts?: BiasAlert[]
  duplicate_ratio?: number
  disabled_symbols?: string[]
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

export interface AccuracyTrendPoint {
  hour: string
  symbol: string
  total: number
  correct: number
  accuracy_pct: number
}

export interface AccuracyTrendResponse {
  trend: AccuracyTrendPoint[]
}

export interface SignalQualitySymbol {
  symbol: string
  long: number
  short: number
  hold: number
}

export interface SignalQualityResponse {
  window_hours?: number
  total_decisions?: number
  actionable?: number
  actionable_rate_pct?: number
  by_type?: Record<string, number>
  by_symbol: Record<string, { long: number; short: number; hold: number }>
  avg_confidence?: number
  recent_signals?: unknown[]
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
  overall?: {
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

export interface ConfidenceBucket {
  bucket: string
  action: string
  decision_type: string
  cnt: number
  avg_conf: number
  avg_score: number
}

export interface ConfidenceData {
  confidence_buckets: ConfidenceBucket[]
  _meta?: Record<string, string>
}

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

export interface RawSignal {
  source: string
  direction: string
  strength: number
  confidence: number
  timeframe?: string
  reasoning: string
}

export interface RawDecisionJson {
  combined?: {
    signals?: RawSignal[]
    agree_ratio?: number
  }
  combined_score?: number
  decision_type?: string
  reasoning?: string
  suggested_stop_loss?: number
  suggested_take_profit?: number
}
