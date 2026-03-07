import { describe, it, expect } from 'vitest'
import { isGroup } from '../../../components/layout/navTypes'
import type { NavItem, NavGroup, NavEntry } from '../../../components/layout/navTypes'

describe('navTypes', () => {
  describe('isGroup', () => {
    it('returns true for NavGroup entries', () => {
      const group: NavGroup = { label: 'Advanced', items: [{ to: '/foo', label: 'Foo' }] }
      expect(isGroup(group)).toBe(true)
    })

    it('returns false for NavItem entries', () => {
      const item: NavItem = { to: '/', label: 'Home', end: true }
      expect(isGroup(item)).toBe(false)
    })

    it('returns false for NavItem without end property', () => {
      const item: NavEntry = { to: '/backtest', label: 'Backtest' }
      expect(isGroup(item)).toBe(false)
    })
  })
})
