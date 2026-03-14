import { describe, it, expect } from 'vitest'
import {
  apiFlowToDisplayPoint,
  apiLargeOrderToDisplay,
} from './types'
import type { OrderbookFlowApiResponse, LargeOrderApiItem } from './types'

describe('apiFlowToDisplayPoint', () => {
  it('converts API response to display point', () => {
    const apiResponse: OrderbookFlowApiResponse = {
      symbol: 'BTCUSDT',
      timestamp: '2026-03-14T12:00:00Z',
      buy_volume: 123.4,
      sell_volume: 98.7,
      imbalance: 0.11,
      imbalance_ma: 0.08,
      trade_count: 1500,
      vwap: 65432.1,
    }

    const point = apiFlowToDisplayPoint(apiResponse)

    expect(point.timestamp).toBe('2026-03-14T12:00:00Z')
    expect(point.buy_volume).toBe(123.4)
    expect(point.sell_volume).toBe(98.7)
    expect(point.net_flow).toBeCloseTo(24.7)
    expect(point.imbalance).toBe(0.11)
  })
})

describe('apiLargeOrderToDisplay', () => {
  it('converts API large order item to display format', () => {
    const item: LargeOrderApiItem = {
      timestamp: '2026-03-14T12:00:00Z',
      side: 'buy',
      qty: 5.2,
      price: 65400,
      z_score: 3.1,
      severity: 'significant',
    }

    const order = apiLargeOrderToDisplay(item, 'BTCUSDT')

    expect(order.id).toBe('2026-03-14T12:00:00Z-BTCUSDT-buy')
    expect(order.symbol).toBe('BTCUSDT')
    expect(order.side).toBe('buy')
    expect(order.size_usd).toBe(5.2 * 65400)
    expect(order.sigma).toBe(3.1)
    expect(order.price).toBe(65400)
  })

  it('handles sell side orders', () => {
    const item: LargeOrderApiItem = {
      timestamp: '2026-03-14T12:05:00Z',
      side: 'sell',
      qty: 2.0,
      price: 65000,
      z_score: 4.5,
      severity: 'extreme',
    }

    const order = apiLargeOrderToDisplay(item, 'BTCUSDT')

    expect(order.id).toBe('2026-03-14T12:05:00Z-BTCUSDT-sell')
    expect(order.side).toBe('sell')
    expect(order.size_usd).toBe(130000)
    expect(order.sigma).toBe(4.5)
  })
})
