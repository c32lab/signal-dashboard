export interface Trade {
  id: string
  timestamp: string          // ISO 8601
  symbol: string             // "BTC/USDT"
  direction: "LONG" | "SHORT"
  entry_price: number
  exit_price: number | null  // null = still open
  quantity: number
  pnl: number | null         // already_pct, null if open
  pnl_usd: number | null
  status: "open" | "closed"
  duration_minutes: number | null
}

export interface Position {
  symbol: string
  direction: "LONG" | "SHORT"
  entry_price: number
  current_price: number
  quantity: number
  unrealized_pnl: number    // already_pct
  unrealized_pnl_usd: number
  entry_time: string
}

export interface AccountSummary {
  balance_usd: number
  equity_usd: number
  total_trades: number
  win_rate: number           // already_pct (e.g. 62.5 = 62.5%)
  profit_factor: number      // ratio (e.g. 1.8)
  avg_win_pct: number        // already_pct
  avg_loss_pct: number       // already_pct
  max_drawdown_pct: number   // already_pct
}

export interface EquityPoint {
  timestamp: string
  equity: number
}
