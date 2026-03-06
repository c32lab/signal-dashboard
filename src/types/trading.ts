// Types aligned with ~/.openclaw/shared/specs/signal-api-schema.md
// Do NOT edit field names — they come from the schema doc.

export interface TradingBalance {
  total_usdt: number
  unrealized_pnl: number
  available: number
}

export interface TradingPosition {
  symbol: string
  side: 'LONG' | 'SHORT'
  size: number
  entry_price: number
  unrealized_pnl: number
  leverage: number
}

export interface TradingTrade {
  id: string
  timestamp: string            // ISO 8601 UTC
  symbol: string
  side: 'LONG' | 'SHORT'
  entry_price: number
  exit_price: number | null
  size: number
  confidence: number           // decimal_0_1 → ×100 for display
  pnl_usdt: number | null
  status: 'open' | 'closed'
}

export interface TradingSummary {
  balance: TradingBalance | null  // null = API key not configured
  positions: TradingPosition[]
  recent_trades: TradingTrade[]
}
