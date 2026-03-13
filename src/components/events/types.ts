export interface ForwardEvent {
  event_id: string
  event_type: string
  category: 'macro' | 'crypto'
  title: string
  event_date: string
  days_until: number
  impact: 'high' | 'medium' | 'low'
  direction: 'bullish' | 'bearish' | 'neutral'
  direction_probability: number
  avg_move_pct: number
  volatility_expected: number
  confidence: number
  sample_count: number
  reasoning: string
}
