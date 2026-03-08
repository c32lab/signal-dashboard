/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  Cell: () => <div />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  ZAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
  ReferenceLine: () => <div />,
  ScatterChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Scatter: () => <div />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Radar: () => <div />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
}))

import BacktestResultView from '../../../components/backtest/BacktestResultView'
import type { BacktestResult } from '../../../types/backtest'

function makeResult(overrides: Partial<BacktestResult> = {}): BacktestResult {
  return {
    generated_at: '2026-03-01T00:00:00Z',
    data_range: { start: '2026-01-01', end: '2026-03-01' },
    configs: {
      A_current: { weights: { rsi: 0.5, macd: 0.3 }, description: 'Current config' },
      B_pre_freeze: { weights: { rsi: 0.4, macd: 0.4 }, description: 'Pre-freeze' },
    },
    summary: [
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
    ],
    by_symbol: {
      'BTC/USDT': [
        {
          config: 'A_current', trades: 50,
          win_rate_pct: 60, total_pnl_pct: 15,
          sharpe: 1.5, regime: 'all',
        },
      ],
    },
    pnl_curve: {
      A_current: [
        { timestamp: '2026-01-02', cumulative_pnl_pct: 1.0, regime: 'all' },
        { timestamp: '2026-01-03', cumulative_pnl_pct: 2.5, regime: 'all' },
      ],
    },
    ...overrides,
  }
}

describe('BacktestResultView', () => {
  it('renders header with title', () => {
    render(<BacktestResultView result={makeResult()} />)
    expect(screen.getByText('Backtest A/B Test')).toBeInTheDocument()
  })

  it('displays data range info', () => {
    render(<BacktestResultView result={makeResult()} />)
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument()
  })

  it('displays total trades count', () => {
    render(<BacktestResultView result={makeResult()} />)
    expect(screen.getByText(/180/)).toBeInTheDocument()
  })

  it('renders summary cards for each config', () => {
    render(<BacktestResultView result={makeResult()} />)
    expect(screen.getAllByText('A_current').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('B_pre_freeze').length).toBeGreaterThanOrEqual(1)
  })

  it('renders parameter comparison section', () => {
    render(<BacktestResultView result={makeResult()} />)
    expect(screen.getByText('Parameter Comparison')).toBeInTheDocument()
  })

  it('renders by-symbol section', () => {
    render(<BacktestResultView result={makeResult()} />)
    expect(screen.getByText('By Symbol')).toBeInTheDocument()
  })

  it('hides data range info when not provided', () => {
    render(<BacktestResultView result={makeResult({ data_range: undefined })} />)
    expect(screen.queryByText(/2026-01-01/)).toBeNull()
  })

  it('handles empty by_symbol', () => {
    render(<BacktestResultView result={makeResult({ by_symbol: {} })} />)
    expect(screen.queryByText('By Symbol')).toBeNull()
  })
})
