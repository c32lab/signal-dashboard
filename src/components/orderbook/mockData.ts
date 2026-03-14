import type { TradeFlowPoint, LargeOrder } from './types'

function minutesAgo(n: number): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - n)
  return d.toISOString()
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function generateTradeFlow(): TradeFlowPoint[] {
  const points: TradeFlowPoint[] = []
  for (let i = 59; i >= 0; i--) {
    const buy = Math.round(rand(500_000, 5_000_000))
    const sell = Math.round(rand(500_000, 5_000_000))
    const net = buy - sell
    const total = buy + sell
    // Mostly oscillate in ±0.3 range with occasional spikes
    let imbalance = total > 0 ? net / total : 0
    if (Math.random() > 0.85) {
      imbalance = imbalance > 0 ? rand(0.4, 0.7) : rand(-0.7, -0.4)
    }
    points.push({
      timestamp: minutesAgo(i),
      buy_volume: buy,
      sell_volume: sell,
      net_flow: net,
      imbalance: Math.round(imbalance * 1000) / 1000,
    })
  }
  return points
}

export const mockTradeFlow: TradeFlowPoint[] = generateTradeFlow()

export interface MockCvdPoint {
  timestamp: string
  cvd_trend: number
  price_trend: number
  divergence_score: number
}

function generateCvdData(): MockCvdPoint[] {
  const points: MockCvdPoint[] = []
  let cvd = 0
  let price = 0
  for (let i = 59; i >= 0; i--) {
    // Both trends drift similarly
    cvd += rand(-0.08, 0.08)
    price += rand(-0.08, 0.08)
    // Every ~15 points, force a divergence
    if (i % 15 < 3 && i > 0) {
      cvd += rand(0.15, 0.25)
      price -= rand(0.1, 0.2)
    }
    // Clamp to [-1, 1]
    cvd = Math.max(-1, Math.min(1, cvd))
    price = Math.max(-1, Math.min(1, price))
    points.push({
      timestamp: minutesAgo(i),
      cvd_trend: Math.round(cvd * 1000) / 1000,
      price_trend: Math.round(price * 1000) / 1000,
      divergence_score: Math.round((cvd - price) * 1000) / 1000,
    })
  }
  return points
}

export const mockCvdData: MockCvdPoint[] = generateCvdData()

export const mockLargeOrders: LargeOrder[] = [
  { id: 'lo-1', timestamp: minutesAgo(3), symbol: 'BTC', side: 'buy', size_usd: 8_200_000, sigma: 6.2, price: 97_450 },
  { id: 'lo-2', timestamp: minutesAgo(8), symbol: 'ETH', side: 'sell', size_usd: 3_100_000, sigma: 4.8, price: 3_820 },
  { id: 'lo-3', timestamp: minutesAgo(15), symbol: 'BTC', side: 'buy', size_usd: 5_500_000, sigma: 5.1, price: 97_320 },
  { id: 'lo-4', timestamp: minutesAgo(22), symbol: 'ETH', side: 'buy', size_usd: 1_800_000, sigma: 3.4, price: 3_805 },
  { id: 'lo-5', timestamp: minutesAgo(35), symbol: 'BTC', side: 'sell', size_usd: 4_200_000, sigma: 4.1, price: 97_200 },
  { id: 'lo-6', timestamp: minutesAgo(48), symbol: 'ETH', side: 'sell', size_usd: 950_000, sigma: 2.3, price: 3_790 },
  { id: 'lo-7', timestamp: minutesAgo(67), symbol: 'BTC', side: 'buy', size_usd: 2_700_000, sigma: 3.8, price: 97_100 },
  { id: 'lo-8', timestamp: minutesAgo(85), symbol: 'ETH', side: 'buy', size_usd: 1_200_000, sigma: 2.7, price: 3_775 },
  { id: 'lo-9', timestamp: minutesAgo(102), symbol: 'BTC', side: 'sell', size_usd: 9_800_000, sigma: 6.5, price: 96_950 },
  { id: 'lo-10', timestamp: minutesAgo(115), symbol: 'ETH', side: 'sell', size_usd: 600_000, sigma: 2.1, price: 3_760 },
]
