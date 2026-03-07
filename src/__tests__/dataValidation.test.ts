import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validatePercent, validatePrice, validatePnL, validateConfidence, fetchDynamicPriceRanges, validatePriceAsync } from '../utils/dataValidation'

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

describe('fetchDynamicPriceRanges', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and caches dynamic price ranges', async () => {
    const mockData = [
      { symbol: 'BTCUSDT', current: 65000, p5: 50000, p95: 80000 },
      { symbol: 'ETHUSDT', current: 3000, p5: 2000, p95: 5000 },
    ]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)

    await fetchDynamicPriceRanges()

    // After fetching, validatePrice should use dynamic ranges
    // BTC/USDT range: [50000*0.7, 80000*1.5] = [35000, 120000]
    expect(validatePrice(65000, 'BTC/USDT')).toEqual({ valid: true })
    const belowRange = validatePrice(30000, 'BTC/USDT')
    expect(belowRange.valid).toBe(false)
    expect(belowRange.warning).toContain('historical range')
    const aboveRange = validatePrice(130000, 'BTC/USDT')
    expect(aboveRange.valid).toBe(false)
  })

  it('skips fetch when cache is fresh', async () => {
    // Cache was populated by the previous test and is still fresh
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)

    // Should skip because cache from prior test is still valid
    await fetchDynamicPriceRanges()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('silently fails on fetch error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    // Should not throw
    await expect(fetchDynamicPriceRanges()).resolves.toBeUndefined()
  })

  it('returns early when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response)
    await expect(fetchDynamicPriceRanges()).resolves.toBeUndefined()
  })

  it('skips entries with null p5/p95', async () => {
    const mockData = [
      { symbol: 'BTCUSDT', current: 65000, p5: null, p95: null },
    ]
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response)

    await fetchDynamicPriceRanges()
    // BTC/USDT should not be in dynamic cache, falls back to static
    // Static range for BTC is [10000, 200000]
    expect(validatePrice(68000, 'BTC/USDT')).toEqual({ valid: true })
  })
})

describe('validatePriceAsync', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns valid when API says valid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true }),
    } as Response)

    const result = await validatePriceAsync(65000, 'BTC/USDT')
    expect(result).toEqual({ valid: true })
  })

  it('returns invalid with reason when API says invalid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: false, reason: 'Price too high' }),
    } as Response)

    const result = await validatePriceAsync(999999, 'BTC/USDT')
    expect(result.valid).toBe(false)
    expect(result.warning).toContain('Price too high')
  })

  it('falls back to sync validation on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response)

    const result = await validatePriceAsync(68000, 'BTC/USDT')
    // Falls back to validatePrice (static), should be valid
    expect(result).toEqual({ valid: true })
  })

  it('falls back to sync validation on fetch error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const result = await validatePriceAsync(68000, 'BTC/USDT')
    expect(result).toEqual({ valid: true })
  })

  it('formats symbol correctly in API call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true }),
    } as Response)

    await validatePriceAsync(3000, 'ETH/USDT')
    expect(fetchSpy).toHaveBeenCalledWith(
      '/data-api/api/price-ranges/validate?symbol=ETHUSDT&price=3000'
    )
  })
})
