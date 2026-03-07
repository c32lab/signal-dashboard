/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  ScatterChart: ({ children }: { children: React.ReactNode }) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: () => <div data-testid="scatter" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  ZAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
  ReferenceLine: () => <div />,
}))

import PerformanceScatter from '../../../components/backtest/PerformanceScatter'
import type { BacktestSummary, BacktestConfig } from '../../../types/backtest'

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

const configs: Record<string, BacktestConfig> = {
  A_current: { weights: { rsi: 0.5 }, description: 'Current config' },
  B_pre_freeze: { weights: { rsi: 0.3 }, description: 'Pre-freeze config' },
}

describe('PerformanceScatter', () => {
  it('renders the chart container', () => {
    render(<PerformanceScatter summary={summary} configs={configs} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders scatter chart', () => {
    render(<PerformanceScatter summary={summary} configs={configs} />)
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
  })

  it('handles empty summary', () => {
    render(<PerformanceScatter summary={[]} configs={configs} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })
})
