export interface Macro {
  score: number
  fear_greed: number
  fear_greed_prev: number
  fear_greed_trend: string
  etf_flow_1d: number
  etf_flow_5d: number
  volume_ratio: number
  funding_rate: number
  funding_rate_avg: number
  reasons: string[]
}

export interface Event {
  id: number
  date: string
  symbol: string
  price_change: number
  close_price: number
  category: string
  event: string
  tags: string[]
  lesson: string
  pattern_name: string
  source: string
  created_at: string
  sources_json: string[]
  url: string
  affected_symbols_json: string[]
  structured_sources_json: unknown[]
}

export interface Pattern {
  id: number
  name: string
  direction: string
  avg_impact: number
  base_level: number
  keywords: string[]
  boost_keywords: string[]
  example_dates: string[]
  notes: string
  created_at: string
  updated_at: string
}

export interface Prediction {
  id: number
  timestamp: string
  symbol: string
  direction: string
  confidence: number
  trigger_event: string
  trigger_pattern: string
  expected_impact: number
  expected_horizon: string
  price_at_prediction: number
  macro_score: number
  fear_greed: number
  reasoning: string
  status: string
  created_at: string
}

export interface ChainNode {
  id: string
  name: string
  type: string
  labels: string[]
}

export interface ChainEdge {
  from_node: string
  to_node: string
  relation: string
  strength: number
}

export interface MacroSnapshot {
  id: number
  timestamp: string
  fear_greed: number
  fear_greed_trend: string
  etf_flow_1d: number
  etf_flow_5d: number
  macro_score: number
  reasons: string[]
  btc_price: number
}

export interface EventKB {
  events: Event[]
  patterns: Pattern[]
}

export interface PredictionsGroup {
  active: Prediction[]
  completed?: Prediction[]
  failed?: Prediction[]
}

export interface PredictionOverview {
  macro: Macro
  event_kb: EventKB
  predictions: PredictionsGroup
  accuracy: unknown
  recent_validations: unknown[]
  macro_history: MacroSnapshot[]
}

export interface Trend {
  pattern_name: string
  event_count: number
  avg_impact: number
  symbols: string[]
  latest_date: string
  window_hours: number
}

export interface IndustryChain {
  nodes: ChainNode[]
  edges: ChainEdge[]
}
