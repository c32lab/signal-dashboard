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

export interface AccuracyResponse {
  period_hours: number
  total_actionable: number
  accuracy: {
    '1h': number
    '4h': number
  }
  by_symbol: Record<string, {
    total: number
    accuracy_1h: number
    accuracy_4h: number
  }>
}

export type ConfidenceData = Record<string, unknown>
export type BacktestData = Record<string, unknown>

export interface DecisionFilters {
  limit?: number
  offset?: number
  symbol?: string
  type?: string
  action?: string
}
