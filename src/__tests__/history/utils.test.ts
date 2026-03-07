import { describe, it, expect } from 'vitest'
import {
  actionBadge,
  dirBadge,
  typeBadge,
  scoreColor,
  accColor,
  pnlColor,
  pnlStr,
  formatPrice,
  stripUsdt,
  parseRawJson,
} from '../../components/history/utils'

describe('actionBadge', () => {
  it('returns green for LONG', () => {
    expect(actionBadge('LONG')).toContain('green')
  })
  it('returns red for SHORT', () => {
    expect(actionBadge('SHORT')).toContain('red')
  })
  it('returns gray for other', () => {
    expect(actionBadge('HOLD')).toContain('gray')
  })
})

describe('dirBadge', () => {
  it('returns green for LONG', () => {
    expect(dirBadge('LONG')).toContain('green')
  })
  it('returns red for SHORT', () => {
    expect(dirBadge('SHORT')).toContain('red')
  })
  it('returns gray for other', () => {
    expect(dirBadge('NEUTRAL')).toContain('gray')
  })
})

describe('typeBadge', () => {
  it('returns blue for FAST', () => {
    expect(typeBadge('FAST')).toContain('blue')
  })
  it('returns purple for SLOW', () => {
    expect(typeBadge('SLOW')).toContain('purple')
  })
  it('returns gray for other', () => {
    expect(typeBadge('MEDIUM')).toContain('gray')
  })
  it('is case insensitive', () => {
    expect(typeBadge('fast')).toContain('blue')
    expect(typeBadge('Slow')).toContain('purple')
  })
})

describe('scoreColor', () => {
  it('returns green for positive', () => {
    expect(scoreColor(5)).toContain('green')
  })
  it('returns red for negative', () => {
    expect(scoreColor(-3)).toContain('red')
  })
  it('returns gray for zero', () => {
    expect(scoreColor(0)).toContain('gray')
  })
})

describe('accColor', () => {
  it('returns green for >50', () => {
    expect(accColor(75)).toContain('green')
  })
  it('returns amber for >=30', () => {
    expect(accColor(30)).toContain('amber')
    expect(accColor(50)).toContain('amber')
  })
  it('returns red for <30', () => {
    expect(accColor(10)).toContain('red')
  })
  it('returns gray for null', () => {
    expect(accColor(null)).toContain('gray')
  })
  it('returns gray for undefined', () => {
    expect(accColor(undefined)).toContain('gray')
  })
})

describe('pnlColor', () => {
  it('returns green for positive', () => {
    expect(pnlColor(1.5)).toContain('green')
  })
  it('returns red for negative', () => {
    expect(pnlColor(-2.3)).toContain('red')
  })
  it('returns gray for zero', () => {
    expect(pnlColor(0)).toContain('gray')
  })
  it('returns gray for null', () => {
    expect(pnlColor(null)).toContain('gray')
  })
})

describe('pnlStr', () => {
  it('formats positive with + prefix', () => {
    expect(pnlStr(5.123)).toBe('+5.12%')
  })
  it('formats negative without + prefix', () => {
    expect(pnlStr(-3.456)).toBe('-3.46%')
  })
  it('returns — for null', () => {
    expect(pnlStr(null)).toBe('—')
  })
  it('returns — for undefined', () => {
    expect(pnlStr(undefined)).toBe('—')
  })
})

describe('formatPrice', () => {
  it('formats >=1 with 2 decimal places', () => {
    const result = formatPrice(1234.5)
    expect(result).toContain('$')
    expect(result).toContain('1,234.50')
  })
  it('formats <1 with 4 decimal places', () => {
    const result = formatPrice(0.12345)
    expect(result).toBe('$0.1235')
  })
  it('returns — for null', () => {
    expect(formatPrice(null)).toBe('—')
  })
  it('returns — for undefined', () => {
    expect(formatPrice(undefined)).toBe('—')
  })
})

describe('stripUsdt', () => {
  it('strips /USDT suffix', () => {
    expect(stripUsdt('BTC/USDT')).toBe('BTC')
  })
  it('strips USDT suffix without slash', () => {
    expect(stripUsdt('ETHUSDT')).toBe('ETH')
  })
  it('returns unchanged if no USDT', () => {
    expect(stripUsdt('BTC')).toBe('BTC')
  })
})

describe('parseRawJson', () => {
  it('parses valid JSON with stop_loss and take_profit', () => {
    const json = JSON.stringify({ suggested_stop_loss: 100, suggested_take_profit: 200 })
    expect(parseRawJson(json)).toEqual({ stop_loss: 100, take_profit: 200 })
  })
  it('returns nulls for missing fields', () => {
    expect(parseRawJson('{}')).toEqual({ stop_loss: null, take_profit: null })
  })
  it('returns nulls for invalid JSON', () => {
    expect(parseRawJson('not json')).toEqual({ stop_loss: null, take_profit: null })
  })
  it('returns nulls for undefined', () => {
    expect(parseRawJson(undefined)).toEqual({ stop_loss: null, take_profit: null })
  })
})
