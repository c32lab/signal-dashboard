import { describe, it, expect } from 'vitest'
import { toDisplayPercent, SIGNAL_FIELDS } from '../utils/fieldConventions'

describe('toDisplayPercent', () => {
  it('returns value as-is for already_pct format', () => {
    expect(toDisplayPercent(43.64, 'already_pct')).toBe(43.64)
  })

  it('multiplies by 100 for decimal_0_1 format', () => {
    expect(toDisplayPercent(0.676, 'decimal_0_1')).toBeCloseTo(67.6)
  })

  it('multiplies by 100 for tiny_decimal format', () => {
    expect(toDisplayPercent(-5.39e-05, 'tiny_decimal')).toBeCloseTo(-0.00539)
  })

  it('handles zero correctly', () => {
    expect(toDisplayPercent(0, 'already_pct')).toBe(0)
    expect(toDisplayPercent(0, 'decimal_0_1')).toBe(0)
    expect(toDisplayPercent(0, 'tiny_decimal')).toBe(0)
  })

  it('handles edge case: confidence=1 → 100%', () => {
    expect(toDisplayPercent(1, 'decimal_0_1')).toBe(100)
  })
})

describe('field definitions', () => {
  it('SIGNAL_FIELDS confidence is decimal_0_1', () => {
    expect(SIGNAL_FIELDS['decision.confidence'].format).toBe('decimal_0_1')
  })

  it('SIGNAL_FIELDS accuracy_pct is already_pct', () => {
    expect(SIGNAL_FIELDS['performance.accuracy_pct'].format).toBe('already_pct')
  })

})
