/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { WalkForwardResponse } from '../../../types/paramMatrix'

const MOCK_DATA: WalkForwardResponse = {
  generated: '2026-03-08T03:19:36Z',
  config: {
    days: 360,
    interval: '1h',
    train_days: 60,
    test_days: 30,
    roll_days: 30,
    top_k: 3,
    starting_balance: 1000.0,
    param_grid: { rsi_period: [8, 14] },
  },
  symbols: [
    {
      symbol: 'BTCUSDT',
      total_bars: 8640,
      data_period: '2025-03-13 -> 2026-03-07',
      num_windows: 2,
      windows: [
        {
          window: 1,
          train_period: '2025-03-13 -> 2025-05-11',
          test_period: '2025-05-12 -> 2025-06-10',
          train_bars: 1440,
          test_bars: 720,
          configs: [
            {
              rank: 1,
              params: { rsi_period: 8 },
              in_sample: { sharpe: 2.43, win_rate: 83.3, return_pct: 0.76, trades: 24, pnl: 7.6 },
              oos: { sharpe: -0.62, win_rate: 62.5, return_pct: -0.147, trades: 8, pnl: -1.47 },
              degradation: -0.2551,
            },
          ],
        },
        {
          window: 2,
          train_period: '2025-04-12 -> 2025-06-10',
          test_period: '2025-06-11 -> 2025-07-10',
          train_bars: 1440,
          test_bars: 720,
          configs: [
            {
              rank: 1,
              params: { rsi_period: 14 },
              in_sample: { sharpe: 1.85, win_rate: 71.4, return_pct: 0.52, trades: 21, pnl: 5.2 },
              oos: { sharpe: 0.91, win_rate: 66.7, return_pct: 0.18, trades: 12, pnl: 1.8 },
              degradation: 0.0312,
            },
          ],
        },
      ],
    },
    {
      symbol: 'ETHUSDT',
      total_bars: 8640,
      data_period: '2025-03-13 -> 2026-03-07',
      num_windows: 1,
      windows: [
        {
          window: 1,
          train_period: '2025-03-13 -> 2025-05-11',
          test_period: '2025-05-12 -> 2025-06-10',
          train_bars: 1440,
          test_bars: 720,
          configs: [
            {
              rank: 1,
              params: { rsi_period: 8 },
              in_sample: { sharpe: 1.55, win_rate: 75.0, return_pct: 0.44, trades: 20, pnl: 4.4 },
              oos: { sharpe: 0.32, win_rate: 58.3, return_pct: 0.05, trades: 12, pnl: 0.5 },
              degradation: -0.1122,
            },
          ],
        },
      ],
    },
  ],
}

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  Line: () => <div />,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}))

vi.mock('../../../hooks/useParamMatrix', () => ({
  useParamMatrix: () => ({ data: null, isLoading: false }),
  useWalkForward: () => ({ data: MOCK_DATA, isLoading: false }),
}))

import WalkForwardChart from '../../../components/backtest/WalkForwardChart'

describe('WalkForwardChart', () => {
  it('renders heading', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('Walk-Forward Analysis')).toBeInTheDocument()
  })

  it('renders symbol selector', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
  })

  it('renders window rows in the detail table', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('W1')).toBeInTheDocument()
    expect(screen.getByText('W2')).toBeInTheDocument()
  })

  it('displays train and test periods', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('2025-03-13 -> 2025-05-11')).toBeInTheDocument()
    expect(screen.getByText('2025-05-12 -> 2025-06-10')).toBeInTheDocument()
  })

  it('displays in-sample and out-of-sample metrics', () => {
    render(<WalkForwardChart />)
    // IS Sharpe from W1
    expect(screen.getByText('2.43')).toBeInTheDocument()
    // OOS Sharpe from W1
    expect(screen.getByText('-0.62')).toBeInTheDocument()
  })

  it('displays degradation values', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('-0.2551')).toBeInTheDocument()
    expect(screen.getByText('0.0312')).toBeInTheDocument()
  })

  it('renders degradation section heading', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('Degradation per Window')).toBeInTheDocument()
  })

  it('renders summary stats card', () => {
    render(<WalkForwardChart />)
    expect(screen.getByTestId('wf-summary-stats')).toBeInTheDocument()
    expect(screen.getByText('Avg IS Sharpe')).toBeInTheDocument()
    expect(screen.getByText('Avg OOS Sharpe')).toBeInTheDocument()
    expect(screen.getByText('Avg Degradation')).toBeInTheDocument()
    expect(screen.getByText('Stability Score')).toBeInTheDocument()
  })

  it('displays drop percentage column', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('Drop %')).toBeInTheDocument()
  })

  it('returns null when no symbols', () => {
    vi.doMock('../../../hooks/useParamMatrix', () => ({
      useParamMatrix: () => ({ data: null, isLoading: false }),
      useWalkForward: () => ({ data: { generated: '', config: {}, symbols: [] }, isLoading: false }),
    }))
  })
})
