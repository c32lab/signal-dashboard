// Data sanity validation utilities (RCA-006)

export interface ValidationResult {
  valid: boolean
  warning?: string
}

// Percent fields validation (0-100 range)
export function validatePercent(value: number, fieldName: string): ValidationResult {
  if (value < 0 || value > 100) {
    return { valid: false, warning: `${fieldName}: ${value}% 超出 0-100 范围` }
  }
  return { valid: true }
}

// Price sanity by symbol (BTCUSDT format)
const PRICE_RANGES: Record<string, [number, number]> = {
  BTCUSDT: [10000, 200000],
  ETHUSDT: [500, 10000],
  SOLUSDT: [10, 500],
  BNBUSDT: [100, 2000],
  XRPUSDT: [0.1, 10],
  AVAXUSDT: [2, 200],
  LINKUSDT: [2, 100],
}

export function validatePrice(price: number, symbol: string): ValidationResult {
  const range = PRICE_RANGES[symbol]
  if (!range) return { valid: true } // unknown symbol, skip
  if (price < range[0] || price > range[1]) {
    return {
      valid: false,
      warning: `${symbol} 价格 ${price} 超出合理范围 [${range[0]}, ${range[1]}]`,
    }
  }
  return { valid: true }
}

// PnL percent validation (single trade -50% ~ +50% is reasonable)
export function validatePnL(pnl: number): ValidationResult {
  if (Math.abs(pnl) > 50) {
    return { valid: false, warning: `PnL ${pnl}% 超出合理范围` }
  }
  return { valid: true }
}

// Confidence validation (0-1 range)
export function validateConfidence(conf: number): ValidationResult {
  if (conf < 0 || conf > 1) {
    return { valid: false, warning: `Confidence ${conf} 超出 0-1 范围` }
  }
  return { valid: true }
}
