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
}

export interface DecisionsResponse {
  decisions: Decision[]
  total: number
  limit: number
  offset: number
}

export interface Signal {
  symbol: string
  direction: string
  confidence: number
  timestamp: string
  action?: string
  price?: number
}

export interface Overview {
  total_decisions: number
  recent_1h: number
  by_direction: Record<string, number>
  by_symbol: Record<string, number>
}

export interface HealthResponse {
  status: string
}

export type Performance = Record<string, unknown>
export type ConfidenceData = Record<string, unknown>
export type SignalQuality = Record<string, unknown>
export type BacktestData = Record<string, unknown>

export interface DecisionFilters {
  limit?: number
  offset?: number
  symbol?: string
  type?: string
  action?: string
}
