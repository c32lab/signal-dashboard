/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}))

import { PerformanceOverview } from '../../../components/dashboard/PerformanceOverview'
import type { PerformanceResponse } from '../../../types'

function makeData(overrides: Partial<PerformanceResponse> = {}): PerformanceResponse {
  return {
    overall: { total: 100, correct: 55, accuracy_pct: 55.0, avg_pnl_pct: 0.125 },
    by_symbol: [
      { symbol: 'BTC/USDT', total: 60, correct: 36, accuracy_pct: 60.0, avg_pnl_pct: 0.200 },
      { symbol: 'ETH/USDT', total: 40, correct: 19, accuracy_pct: 47.5, avg_pnl_pct: -0.050 },
    ],
    ...overrides,
  }
}

describe('PerformanceOverview', () => {
  it('renders overall total decisions', () => {
    render(<PerformanceOverview data={makeData()} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('Total Decisions')).toBeInTheDocument()
  })

  it('renders overall accuracy with green color (>50%)', () => {
    render(<PerformanceOverview data={makeData()} />)
    const el = screen.getByText('55.0%')
    expect(el).toBeInTheDocument()
    expect(el.style.color).toBe('rgb(52, 211, 153)') // #34d399
  })

  it('renders overall accuracy with red color (<40%)', () => {
    render(<PerformanceOverview data={makeData({ overall: { total: 50, correct: 15, accuracy_pct: 30.0, avg_pnl_pct: -0.100 } })} />)
    const el = screen.getByText('30.0%')
    expect(el).toBeInTheDocument()
    expect(el.style.color).toBe('rgb(248, 113, 113)') // #f87171
  })

  it('renders per-symbol table rows', () => {
    render(<PerformanceOverview data={makeData()} />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('36')).toBeInTheDocument()
  })

  it('renders avg PnL with correct sign prefix', () => {
    render(<PerformanceOverview data={makeData()} />)
    expect(screen.getByText('+0.125%')).toBeInTheDocument()
    // Negative PnL for ETH
    expect(screen.getByText('-0.050%')).toBeInTheDocument()
  })

  it('renders yellow color for accuracy between 40-50%', () => {
    render(<PerformanceOverview data={makeData({ overall: { total: 100, correct: 45, accuracy_pct: 45.0, avg_pnl_pct: 0.010 } })} />)
    const el = screen.getByText('45.0%')
    expect(el.style.color).toBe('rgb(251, 191, 36)') // #fbbf24
  })
})
