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
