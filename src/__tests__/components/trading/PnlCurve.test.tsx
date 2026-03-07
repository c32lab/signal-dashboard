/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
}))

import PnlCurve from '../../../components/trading/PnlCurve'

describe('PnlCurve', () => {
  it('renders chart when data is provided', () => {
    const data = [
      { time: '2026-03-07T01:00:00Z', cumPnl: 10 },
      { time: '2026-03-07T02:00:00Z', cumPnl: 25 },
    ]
    render(<PnlCurve data={data} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders nothing when data is empty', () => {
    const { container } = render(<PnlCurve data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders title', () => {
    const data = [{ time: '2026-03-07T01:00:00Z', cumPnl: 10 }]
    render(<PnlCurve data={data} />)
    expect(screen.getByText(/PnL/)).toBeInTheDocument()
  })

  it('renders area chart', () => {
    const data = [
      { time: '2026-03-07T01:00:00Z', cumPnl: -5 },
      { time: '2026-03-07T02:00:00Z', cumPnl: -10 },
    ]
    render(<PnlCurve data={data} />)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
  })
})
