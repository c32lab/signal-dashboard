import { describe, it, expect } from 'vitest'
import { validatePercent, validatePrice, validatePnL, validateConfidence } from '../utils/dataValidation'

describe('validatePercent', () => {
  it('accepts valid percent (0-100)', () => {
    expect(validatePercent(50, 'test')).toEqual({ valid: true })
    expect(validatePercent(0, 'test')).toEqual({ valid: true })
    expect(validatePercent(100, 'test')).toEqual({ valid: true })
  })

  it('rejects negative percent', () => {
    const result = validatePercent(-1, 'accuracy')
    expect(result.valid).toBe(false)
    expect(result.warning).toContain('accuracy')
  })

  it('rejects percent > 100', () => {
    const result = validatePercent(101, 'accuracy')
    expect(result.valid).toBe(false)
  })
})

describe('validatePrice (static fallback)', () => {
  it('accepts BTC price in range', () => {
    expect(validatePrice(68000, 'BTC/USDT')).toEqual({ valid: true })
  })

  it('rejects BTC price below range', () => {
    const result = validatePrice(100, 'BTC/USDT')
    expect(result.valid).toBe(false)
    expect(result.warning).toContain('BTC/USDT')
  })

  it('rejects BTC price above range', () => {
    const result = validatePrice(999999, 'BTC/USDT')
    expect(result.valid).toBe(false)
  })

  it('accepts ETH price in range', () => {
    expect(validatePrice(3500, 'ETH/USDT')).toEqual({ valid: true })
  })

  it('returns valid for unknown symbol', () => {
    expect(validatePrice(999, 'UNKNOWN/USDT')).toEqual({ valid: true })
  })
})

describe('validatePnL', () => {
  it('accepts reasonable PnL', () => {
    expect(validatePnL(5)).toEqual({ valid: true })
    expect(validatePnL(-10)).toEqual({ valid: true })
    expect(validatePnL(50)).toEqual({ valid: true })
  })

  it('rejects extreme PnL', () => {
    expect(validatePnL(51).valid).toBe(false)
    expect(validatePnL(-51).valid).toBe(false)
  })
})

describe('validateConfidence', () => {
  it('accepts valid confidence (0-1)', () => {
    expect(validateConfidence(0)).toEqual({ valid: true })
    expect(validateConfidence(0.5)).toEqual({ valid: true })
    expect(validateConfidence(1)).toEqual({ valid: true })
  })

  it('rejects confidence out of range', () => {
    expect(validateConfidence(-0.1).valid).toBe(false)
    expect(validateConfidence(1.1).valid).toBe(false)
  })
})
