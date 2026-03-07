/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SideBadge, StatusBadge, PnlText } from '../../components/trading/TradingBadges'

describe('SideBadge', () => {
  it('renders LONG with green styling', () => {
    render(<SideBadge side="LONG" />)
    const badge = screen.getByText('LONG')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-green-900')
  })

  it('renders SHORT with red styling', () => {
    render(<SideBadge side="SHORT" />)
    const badge = screen.getByText('SHORT')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-red-900')
  })
})

describe('StatusBadge', () => {
  it('renders open status', () => {
    render(<StatusBadge status="open" />)
    const badge = screen.getByText('开仓中')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-blue-900')
  })

  it('renders closed status', () => {
    render(<StatusBadge status="closed" />)
    const badge = screen.getByText('已平仓')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-gray-700')
  })
})

describe('PnlText', () => {
  it('renders dash for null value', () => {
    render(<PnlText value={null} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders positive value with green color and plus sign', () => {
    render(<PnlText value={123.45} />)
    const el = screen.getByText('+123.45')
    expect(el.className).toContain('text-green-400')
  })

  it('renders negative value with red color', () => {
    render(<PnlText value={-50.1} />)
    const el = screen.getByText('-50.10')
    expect(el.className).toContain('text-red-400')
  })

  it('renders zero as positive (green with +)', () => {
    render(<PnlText value={0} />)
    const el = screen.getByText('+0.00')
    expect(el.className).toContain('text-green-400')
  })
})
