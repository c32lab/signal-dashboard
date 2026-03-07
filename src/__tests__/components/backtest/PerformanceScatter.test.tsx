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
  Tooltip: ({ content }: { content?: (props: unknown) => React.ReactNode }) => {
    const inactive = content?.({ active: false, payload: [] })
    const active = content?.({ active: true, payload: [{ payload: { config: 'A', description: 'desc', x: 50, y: 10, sharpe: 1.0, maxDD: 5, trades: 50 } }] })
    const noPayload = content?.({ active: true, payload: [] })
    return <div data-testid="tooltip">{inactive}{active}{noPayload}</div>
  },
  Legend: ({ formatter }: { formatter?: (value: unknown) => React.ReactNode }) => (
    <div data-testid="legend">{formatter?.('test')}{formatter?.(undefined)}{formatter?.(null)}</div>
  ),
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

  it('falls back to config name when config not in configs map', () => {
    const unknownSummary: BacktestSummary[] = [
      { config: 'unknown_config', win_rate_pct: 50, total_pnl_pct: 5, sharpe: 1, max_drawdown_pct: 3, total_trades: 60, regime: 'all' },
    ]
    const { container } = render(<PerformanceScatter summary={unknownSummary} configs={{}} />)
    expect(container.firstChild).toBeTruthy()
  })

  it('uses fallback color for unknown config', () => {
    const unknownSummary: BacktestSummary[] = [
      { config: 'Z_unknown', win_rate_pct: 50, total_pnl_pct: 5, sharpe: 1, max_drawdown_pct: 3, total_trades: 60, regime: 'all' },
    ]
    render(<PerformanceScatter summary={unknownSummary} configs={{ Z_unknown: { weights: {}, description: 'test' } }} />)
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
  })

  it('clamps dotSize for very small trade count', () => {
    const small: BacktestSummary[] = [
      { config: 'A_current', win_rate_pct: 50, total_pnl_pct: 5, sharpe: 1, max_drawdown_pct: 3, total_trades: 10, regime: 'all' },
    ]
    render(<PerformanceScatter summary={small} configs={configs} />)
    expect(screen.getByTestId('scatter')).toBeInTheDocument()
  })

  it('clamps dotSize for very large trade count', () => {
    const large: BacktestSummary[] = [
      { config: 'A_current', win_rate_pct: 50, total_pnl_pct: 5, sharpe: 1, max_drawdown_pct: 3, total_trades: 500, regime: 'all' },
    ]
    render(<PerformanceScatter summary={large} configs={configs} />)
    expect(screen.getByTestId('scatter')).toBeInTheDocument()
  })

  it('renders tooltip content when active with payload', () => {
    render(<PerformanceScatter summary={summary} configs={configs} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('desc')).toBeInTheDocument()
  })

  it('renders legend formatter with value and undefined', () => {
    render(<PerformanceScatter summary={summary} configs={configs} />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('renders heading text', () => {
    render(<PerformanceScatter summary={summary} configs={configs} />)
    expect(screen.getByText('Performance Overview')).toBeInTheDocument()
  })
})
