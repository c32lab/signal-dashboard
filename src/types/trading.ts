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
  timestamp: string
  symbol: string
  side: 'LONG' | 'SHORT'
  entry_price: number
  exit_price: number | null
  size: number
  pnl_usdt: number | null
  duration_seconds: number | null
  status: 'open' | 'closed'
}

export interface TradingSummary {
  balance: TradingBalance
  positions: TradingPosition[]
  recent_trades: TradingTrade[]
}
