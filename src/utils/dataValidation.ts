// Data sanity validation utilities (RCA-006)

export interface ValidationResult {
  valid: boolean
  warning?: string
}

// Percent fields validation (0-100 range)
export function validatePercent(value: number, fieldName: string): ValidationResult {
  if (value < 0 || value > 100) {
    return { valid: false, warning: `${fieldName}: ${value}% out of 0-100 range` }
  }
  return { valid: true }
}

// Price sanity by symbol — prefers dynamic validation via data-eng API (:8081),
// falls back to static ranges if API unavailable.

const STATIC_PRICE_RANGES: Record<string, [number, number]> = {
  'BTC/USDT': [10000, 200000],
  'ETH/USDT': [500, 10000],
  'SOL/USDT': [10, 500],
  'BNB/USDT': [100, 2000],
  'XRP/USDT': [0.1, 10],

}

// Cache for dynamic price ranges from data-eng API
let dynamicRangesCache: Record<string, { lower: number; upper: number }> | null = null
let dynamicRangesFetchedAt = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

/** Fetch dynamic price bounds from data-eng API (non-blocking, caches result) */
export async function fetchDynamicPriceRanges(): Promise<void> {
  if (dynamicRangesCache && Date.now() - dynamicRangesFetchedAt < CACHE_TTL_MS) return
  try {
    const res = await fetch('/data-api/api/price-ranges')
    if (!res.ok) return
    const data: Array<{ symbol: string; current: number; p5: number; p95: number }> = await res.json()
    const cache: Record<string, { lower: number; upper: number }> = {}
    for (const r of data) {
      if (r.p5 != null && r.p95 != null) {
        // Use p5 * 0.7 and p95 * 1.5 as bounds (same logic as backend validate)
        cache[r.symbol.replace('USDT', '/USDT')] = { lower: r.p5 * 0.7, upper: r.p95 * 1.5 }
      }
    }
    dynamicRangesCache = cache
    dynamicRangesFetchedAt = Date.now()
  } catch {
    // silently fail, use static ranges
  }
}

export function validatePrice(price: number, symbol: string): ValidationResult {
  // Try dynamic ranges first
  if (dynamicRangesCache?.[symbol]) {
    const { lower, upper } = dynamicRangesCache[symbol]
    if (price < lower || price > upper) {
      return {
        valid: false,
        warning: `${symbol} price ${price} out of historical range [${lower.toFixed(2)}, ${upper.toFixed(2)}]`,
      }
    }
    return { valid: true }
  }
  // Fallback to static
  const range = STATIC_PRICE_RANGES[symbol]
  if (!range) return { valid: true }
  if (price < range[0] || price > range[1]) {
    return {
      valid: false,
      warning: `${symbol} price ${price} out of reasonable range [${range[0]}, ${range[1]}]`,
    }
  }
  return { valid: true }
}

/** Validate price via data-eng API (async, for SL/TP with precise check) */
export async function validatePriceAsync(price: number, symbol: string): Promise<ValidationResult> {
  try {
    const sym = symbol.replace('/', '')
    const res = await fetch(`/data-api/api/price-ranges/validate?symbol=${sym}&price=${price}`)
    if (!res.ok) return validatePrice(price, symbol) // fallback
    const data: { valid: boolean; reason?: string } = await res.json()
    if (!data.valid) {
      return { valid: false, warning: `${symbol} price ${price}: ${data.reason}` }
    }
    return { valid: true }
  } catch {
    return validatePrice(price, symbol) // fallback to sync
  }
}

// PnL percent validation (single trade -50% ~ +50% is reasonable)
export function validatePnL(pnl: number): ValidationResult {
  if (Math.abs(pnl) > 50) {
    return { valid: false, warning: `PnL ${pnl}% out of reasonable range` }
  }
  return { valid: true }
}

// Confidence validation (0-1 range)
export function validateConfidence(conf: number): ValidationResult {
  if (conf < 0 || conf > 1) {
    return { valid: false, warning: `Confidence ${conf} out of 0-1 range` }
  }
  return { valid: true }
}
