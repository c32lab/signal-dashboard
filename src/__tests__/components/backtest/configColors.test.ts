import { describe, it, expect } from 'vitest'
import { CONFIG_COLORS } from '../../../components/backtest/configColors'

describe('configColors', () => {
  it('defines color for A_current', () => {
    expect(CONFIG_COLORS.A_current).toBe('#60a5fa')
  })

  it('defines color for B_pre_freeze', () => {
    expect(CONFIG_COLORS.B_pre_freeze).toBe('#f97316')
  })

  it('defines color for C_balanced', () => {
    expect(CONFIG_COLORS.C_balanced).toBe('#a78bfa')
  })

  it('has exactly 3 color entries', () => {
    expect(Object.keys(CONFIG_COLORS)).toHaveLength(3)
  })

  it('returns undefined for unknown config', () => {
    expect(CONFIG_COLORS['unknown']).toBeUndefined()
  })
})
