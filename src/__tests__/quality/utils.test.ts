import { describe, it, expect } from 'vitest'
import {
  accuracyColor,
  pnlColor,
  pnlStr,
  formatHour,
  SYMBOL_COLORS,
  TREND_COLORS,
  TOOLTIP_STYLE,
} from '../../components/quality/utils'

describe('accuracyColor', () => {
  it('returns green for >50', () => {
    expect(accuracyColor(51)).toBe('#34d399')
    expect(accuracyColor(100)).toBe('#34d399')
  })

  it('returns yellow for >=30 and <=50', () => {
    expect(accuracyColor(30)).toBe('#fbbf24')
    expect(accuracyColor(50)).toBe('#fbbf24')
    expect(accuracyColor(40)).toBe('#fbbf24')
  })

  it('returns red for <30', () => {
    expect(accuracyColor(29)).toBe('#f87171')
    expect(accuracyColor(0)).toBe('#f87171')
  })
})

describe('pnlColor', () => {
  it('returns green class for positive', () => {
    expect(pnlColor(1.5)).toBe('text-green-400')
  })

  it('returns red class for negative', () => {
    expect(pnlColor(-0.5)).toBe('text-red-400')
  })

  it('returns gray class for zero', () => {
    expect(pnlColor(0)).toBe('text-gray-400')
  })

  it('returns gray class for null/undefined', () => {
    expect(pnlColor(null)).toBe('text-gray-400')
    expect(pnlColor(undefined)).toBe('text-gray-400')
  })
})

describe('pnlStr', () => {
  it('formats positive with + prefix', () => {
    expect(pnlStr(1.234)).toBe('+1.23%')
  })

  it('formats negative without + prefix', () => {
    expect(pnlStr(-2.5)).toBe('-2.50%')
  })

  it('returns — for null/undefined', () => {
    expect(pnlStr(null)).toBe('—')
    expect(pnlStr(undefined)).toBe('—')
  })
})

describe('formatHour', () => {
  it('formats valid date string', () => {
    const result = formatHour('2026-03-07T12:00:00Z')
    expect(typeof result).toBe('string')
    expect(result).not.toBe('2026-03-07T12:00:00Z')
  })

  it('returns input for invalid date', () => {
    expect(formatHour('not-a-date')).toBe('not-a-date')
  })
})

describe('SYMBOL_COLORS', () => {
  it('has entries for BTC, ETH, SOL, BNB, XRP', () => {
    expect(SYMBOL_COLORS['BTC/USDT']).toBeDefined()
    expect(SYMBOL_COLORS['ETH/USDT']).toBeDefined()
    expect(SYMBOL_COLORS['SOL/USDT']).toBeDefined()
    expect(SYMBOL_COLORS['BNB/USDT']).toBeDefined()
    expect(SYMBOL_COLORS['XRP/USDT']).toBeDefined()
  })
})

describe('TREND_COLORS', () => {
  it('is an array of 8 colors', () => {
    expect(TREND_COLORS).toHaveLength(8)
    TREND_COLORS.forEach((c) => expect(c).toMatch(/^#/))
  })
})

describe('TOOLTIP_STYLE', () => {
  it('has contentStyle, labelStyle, itemStyle', () => {
    expect(TOOLTIP_STYLE.contentStyle).toBeDefined()
    expect(TOOLTIP_STYLE.labelStyle).toBeDefined()
    expect(TOOLTIP_STYLE.itemStyle).toBeDefined()
  })
})
