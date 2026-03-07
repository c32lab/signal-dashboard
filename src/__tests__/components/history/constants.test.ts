import { describe, it, expect } from 'vitest'
import { PAGE_SIZE, ACTIONS, DIRECTIONS, TIME_PERIODS } from '../../../components/history/constants'

describe('history constants', () => {
  it('PAGE_SIZE is 50', () => {
    expect(PAGE_SIZE).toBe(50)
  })

  it('ACTIONS contains LONG, SHORT, HOLD', () => {
    expect(ACTIONS).toEqual(['LONG', 'SHORT', 'HOLD'])
  })

  it('DIRECTIONS contains LONG, SHORT, NEUTRAL', () => {
    expect(DIRECTIONS).toEqual(['LONG', 'SHORT', 'NEUTRAL'])
  })

  it('TIME_PERIODS has 4 entries with correct labels', () => {
    expect(TIME_PERIODS).toHaveLength(4)
    expect(TIME_PERIODS.map((t) => t.label)).toEqual(['Last 1h', 'Last 6h', 'Last 24h', 'Last 7d'])
  })

  it('TIME_PERIODS ms values are correct', () => {
    expect(TIME_PERIODS[0].ms).toBe(3_600_000)       // 1h
    expect(TIME_PERIODS[1].ms).toBe(21_600_000)      // 6h
    expect(TIME_PERIODS[2].ms).toBe(86_400_000)      // 24h
    expect(TIME_PERIODS[3].ms).toBe(604_800_000)     // 7d
  })
})
