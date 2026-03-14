// Display types (used by components)
export interface TradeFlowPoint {
  timestamp: string
  buy_volume: number
  sell_volume: number
  net_flow: number
  imbalance: number
}

export interface LargeOrder {
  id: string
  timestamp: string
  symbol: string
  side: 'buy' | 'sell'
  size_usd: number
  sigma: number
  price: number
}

// Legacy response types (kept for compatibility)
export interface OrderbookFlowResponse {
  symbol: string
  window: '1m' | '5m'
  data: TradeFlowPoint[]
}

export interface LargeOrdersResponse {
  orders: LargeOrder[]
  threshold_2sigma: number
  threshold_4sigma: number
}

// API response types (match Signal API endpoints)
export interface OrderbookFlowApiResponse {
  symbol: string
  timestamp: string
  buy_volume: number
  sell_volume: number
  imbalance: number
  imbalance_ma: number
  trade_count: number
  vwap: number
}

export interface LargeOrderApiItem {
  timestamp: string
  side: 'buy' | 'sell'
  qty: number
  price: number
  z_score: number
  severity: 'significant' | 'extreme'
}

export interface LargeOrderApiResponse {
  symbol: string
  large_orders: LargeOrderApiItem[]
  stats: {
    count_2sigma: number
    count_4sigma: number
    net_large_volume: number
  }
}

export interface CvdApiResponse {
  symbol: string
  cvd_30m: number
  cvd_5m: number
  cvd_trend: number
  price_trend: number
  divergence_score: number
  divergence_type: string
}

// Adapter functions
export function apiFlowToDisplayPoint(r: OrderbookFlowApiResponse): TradeFlowPoint {
  const net = r.buy_volume - r.sell_volume
  return {
    timestamp: r.timestamp,
    buy_volume: r.buy_volume,
    sell_volume: r.sell_volume,
    net_flow: net,
    imbalance: r.imbalance,
  }
}

export function apiLargeOrderToDisplay(item: LargeOrderApiItem, symbol: string): LargeOrder {
  return {
    id: `${item.timestamp}-${symbol}-${item.side}`,
    timestamp: item.timestamp,
    symbol,
    side: item.side,
    size_usd: item.qty * item.price,
    sigma: item.z_score,
    price: item.price,
  }
}
