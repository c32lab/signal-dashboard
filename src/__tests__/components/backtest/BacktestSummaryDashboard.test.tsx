/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ParamMatrixResponse, WalkForwardResponse } from '../../../types/paramMatrix'

const MATRIX_DATA: ParamMatrixResponse = {
  symbols: {
    ETHUSDT: {
      total_configs: 2,
      results: [
        { params: { rsi_period: 8, bb_period: 16 }, trades: 41, wins: 26, win_rate: 63.4, pnl: 9.44, return_pct: 0.094, sharpe: 0.64 },
        { params: { rsi_period: 14, bb_period: 20 }, trades: 22, wins: 16, win_rate: 72.7, pnl: 15.60, return_pct: 0.156, sharpe: 1.15 },
      ],
    },
  },
}

const WF_DATA: WalkForwardResponse = {
  generated: '2026-03-08T03:19:36Z',
  config: {
    days: 360, interval: '1h', train_days: 60, test_days: 30, roll_days: 30, top_k: 3, starting_balance: 1000, param_grid: {},
  },
  symbols: [
    {
      symbol: 'BTCUSDT',
      total_bars: 8640,
      data_period: '2025-03-13 -> 2026-03-07',
      num_windows: 2,
      windows: [
        {
          window: 1, train_period: '', test_period: '', train_bars: 1440, test_bars: 720,
          configs: [{ rank: 1, params: {}, in_sample: { sharpe: 2.0, win_rate: 80, return_pct: 0.5, trades: 20, pnl: 5 }, oos: { sharpe: 0.5, win_rate: 60, return_pct: 0.1, trades: 10, pnl: 1 }, degradation: -0.1 }],
        },
        {
          window: 2, train_period: '', test_period: '', train_bars: 1440, test_bars: 720,
          configs: [{ rank: 1, params: {}, in_sample: { sharpe: 1.5, win_rate: 70, return_pct: 0.3, trades: 15, pnl: 3 }, oos: { sharpe: 1.0, win_rate: 65, return_pct: 0.2, trades: 12, pnl: 2 }, degradation: 0.05 }],
        },
      ],
    },
  ],
}

vi.mock('../../../hooks/useParamMatrix', () => ({
  useParamMatrix: () => ({ data: MATRIX_DATA, isLoading: false }),
  useWalkForward: () => ({ data: WF_DATA, isLoading: false }),
}))

import BacktestSummaryDashboard from '../../../components/backtest/BacktestSummaryDashboard'

describe('BacktestSummaryDashboard', () => {
  it('renders executive summary heading', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByText('Executive Summary')).toBeInTheDocument()
  })

  it('renders the container with test id', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByTestId('backtest-summary-dashboard')).toBeInTheDocument()
  })

  it('shows best sharpe from matrix data', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByText('Best Sharpe')).toBeInTheDocument()
    expect(screen.getByText('1.15')).toBeInTheDocument()
  })

  it('shows avg sharpe from matrix data', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByText('Avg Sharpe')).toBeInTheDocument()
  })

  it('shows configs tested count', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByText('Configs Tested')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows OOS Sharpe from walk-forward data', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByText('OOS Sharpe')).toBeInTheDocument()
  })

  it('shows avg degradation', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByText('Avg Degradation')).toBeInTheDocument()
  })

  it('shows stability score', () => {
    render(<BacktestSummaryDashboard />)
    expect(screen.getByText('Stability')).toBeInTheDocument()
    expect(screen.getByText('OOS Sharpe StdDev')).toBeInTheDocument()
  })

  it('returns null when no data', () => {
    vi.doMock('../../../hooks/useParamMatrix', () => ({
      useParamMatrix: () => ({ data: null, isLoading: false }),
      useWalkForward: () => ({ data: null, isLoading: false }),
    }))
  })
})
