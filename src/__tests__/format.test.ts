import { describe, it, expect } from 'vitest'
import { formatDateTime, formatTime, formatDate, formatChartTime, formatPrice } from '../utils/format'

// Use a fixed UTC timestamp: 2026-03-06T09:09:23.000Z → UTC+8 = 17:09:23
const TS = '2026-03-06T09:09:23.000Z'

describe('formatDateTime', () => {
  it('formats full date+time in UTC+8', () => {
    expect(formatDateTime(TS)).toBe('03-06 17:09 UTC+8')
  })

  it('accepts numeric timestamp', () => {
    const ms = new Date(TS).getTime()
    expect(formatDateTime(ms)).toBe('03-06 17:09 UTC+8')
  })

  it('pads single-digit month/day/hour', () => {
    // 2026-01-02T01:05:00Z → UTC+8 = 09:05
    expect(formatDateTime('2026-01-02T01:05:00Z')).toBe('01-02 09:05 UTC+8')
  })
})

describe('formatTime', () => {
  it('returns HH:MM:SS in UTC+8', () => {
    expect(formatTime(TS)).toBe('17:09:23')
  })
})

describe('formatDate', () => {
  it('returns YYYY-MM-DD in UTC+8', () => {
    expect(formatDate(TS)).toBe('2026-03-06')
  })

  it('handles date boundary crossing (UTC late night → next day in UTC+8)', () => {
    // 2026-03-06T23:00:00Z → UTC+8 = 2026-03-07 07:00
    expect(formatDate('2026-03-06T23:00:00Z')).toBe('2026-03-07')
  })
})

describe('formatChartTime', () => {
  it('returns HH:MM in UTC+8', () => {
    expect(formatChartTime(TS)).toBe('17:09')
  })
})

describe('formatPrice', () => {
  it('formats BTC with 2 decimal places', () => {
    expect(formatPrice(68292.06, 'BTCUSDT')).toBe('$68,292.06')
  })

  it('formats ETH with 2 decimal places', () => {
    expect(formatPrice(3500, 'ETHUSDT')).toBe('$3,500.00')
  })

  it('formats small coin with 4 decimal places', () => {
    expect(formatPrice(0.0523, 'DOGEUSDT')).toBe('$0.0523')
  })

  it('formats value >= 1 without symbol as 2 decimals', () => {
    expect(formatPrice(85.37)).toBe('$85.37')
  })

  it('formats value < 1 without symbol as 4 decimals', () => {
    expect(formatPrice(0.5)).toBe('$0.5000')
  })
})
