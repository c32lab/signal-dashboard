import { describe, it, expect } from 'vitest'
import { RegimeFilter, RegimeMiniCard, SummaryCard, CONFIG_COLORS } from '../../../components/backtest'

describe('backtest barrel exports', () => {
  it('exports all expected components and constants', () => {
    expect(RegimeFilter).toBeDefined()
    expect(RegimeMiniCard).toBeDefined()
    expect(SummaryCard).toBeDefined()
    expect(CONFIG_COLORS).toBeDefined()
  })
})
