/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
}))

import TradeDistributionChart from '../../../components/backtest/TradeDistributionChart'
import type { BacktestSummary } from '../../../types/backtest'

const summary: BacktestSummary[] = [
  {
    config: 'A_current', win_rate_pct: 55, total_pnl_pct: 12.5,
    sharpe: 1.2, max_drawdown_pct: 8, total_trades: 100,
    regime: 'all',
  },
  {
    config: 'B_pre_freeze', win_rate_pct: 48, total_pnl_pct: -3.2,
    sharpe: 0.5, max_drawdown_pct: 15, total_trades: 80,
    regime: 'all',
  },
]

describe('TradeDistributionChart', () => {
  it('renders the chart container', () => {
    render(<TradeDistributionChart summary={summary} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders bar chart', () => {
    render(<TradeDistributionChart summary={summary} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<TradeDistributionChart summary={summary} />)
    expect(screen.getByText('Trade Distribution')).toBeInTheDocument()
  })

  it('handles empty summary', () => {
    render(<TradeDistributionChart summary={[]} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})
