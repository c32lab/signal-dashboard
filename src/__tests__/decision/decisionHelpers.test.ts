import { describe, it, expect, vi } from 'vitest'
import {
  PAGE_SIZE,
  DIRECTIONS,
  TIME_PRESETS,
  fromIso,
  directionBadge,
  typeBadge,
  formatTs,
} from '../../components/decision/decisionHelpers'

describe('decisionHelpers', () => {
  describe('constants', () => {
    it('PAGE_SIZE is 20', () => {
      expect(PAGE_SIZE).toBe(20)
    })

    it('DIRECTIONS contains LONG, SHORT, HOLD', () => {
      expect(DIRECTIONS).toEqual(['LONG', 'SHORT', 'HOLD'])
    })

    it('TIME_PRESETS has correct values', () => {
      const values = TIME_PRESETS.map((p) => p.value)
      expect(values).toEqual(['1h', '6h', '24h', '7d', 'all'])
    })

    it('TIME_PRESETS have hours except "all"', () => {
      for (const p of TIME_PRESETS) {
        if (p.value === 'all') {
          expect(p.hours).toBeUndefined()
        } else {
          expect(p.hours).toBeTypeOf('number')
        }
      }
    })
  })

  describe('fromIso', () => {
    it('returns an ISO string', () => {
      const result = fromIso(1)
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    })

    it('rounds to the nearest minute', () => {
      const result = fromIso(1)
      const date = new Date(result)
      expect(date.getSeconds()).toBe(0)
      expect(date.getMilliseconds()).toBe(0)
    })

    it('subtracts the correct number of hours', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)
      const result = fromIso(6)
      const diff = now - new Date(result).getTime()
      // Should be approximately 6 hours (within 1 minute due to rounding)
      expect(diff).toBeGreaterThanOrEqual(6 * 3600_000 - 60_000)
      expect(diff).toBeLessThanOrEqual(6 * 3600_000 + 60_000)
      vi.restoreAllMocks()
    })
  })

  describe('directionBadge', () => {
    it('returns green classes for LONG', () => {
      expect(directionBadge('LONG')).toBe('bg-green-900 text-green-300')
    })

    it('returns red classes for SHORT', () => {
      expect(directionBadge('SHORT')).toBe('bg-red-900 text-red-300')
    })

    it('returns gray classes for HOLD', () => {
      expect(directionBadge('HOLD')).toBe('bg-gray-800 text-gray-400')
    })

    it('returns gray classes for unknown direction', () => {
      expect(directionBadge('UNKNOWN')).toBe('bg-gray-800 text-gray-400')
    })
  })

  describe('typeBadge', () => {
    it('returns blue classes for FAST', () => {
      expect(typeBadge('FAST')).toBe('bg-blue-900 text-blue-300')
    })

    it('returns purple classes for SLOW', () => {
      expect(typeBadge('SLOW')).toBe('bg-purple-900 text-purple-300')
    })

    it('handles case insensitive input', () => {
      expect(typeBadge('fast')).toBe('bg-blue-900 text-blue-300')
      expect(typeBadge('slow')).toBe('bg-purple-900 text-purple-300')
    })

    it('returns gray classes for unknown type', () => {
      expect(typeBadge('OTHER')).toBe('bg-gray-800 text-gray-500')
    })
  })

  describe('formatTs', () => {
    it('formats a valid timestamp', () => {
      const result = formatTs('2026-03-08T12:00:00Z')
      expect(result).toBeTruthy()
      expect(result).not.toBe('2026-03-08T12:00:00Z')
    })

    it('returns input for invalid timestamp', () => {
      expect(formatTs('not-a-date')).toBe('not-a-date')
    })

    it('returns input for empty string (invalid date)', () => {
      expect(formatTs('')).toBe('')
    })
  })
})
