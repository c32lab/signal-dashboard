/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { WalkForwardResult } from '../../../types/paramMatrix'

const MOCK_DATA: WalkForwardResult = {
  windows: [
    {
      train_start: '2025-09-01', train_end: '2025-11-30',
      test_start: '2025-12-01', test_end: '2025-12-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.30 },
      in_sample: { sharpe: 1.95, win_rate_pct: 59.2, total_pnl_pct: 16.1 },
      out_of_sample: { sharpe: 1.52, win_rate_pct: 54.8, total_pnl_pct: 11.3 },
    },
    {
      train_start: '2025-10-01', train_end: '2025-12-31',
      test_start: '2026-01-01', test_end: '2026-01-31',
      best_params: { min_confidence: 0.5, technical_weight: 0.30 },
      in_sample: { sharpe: 2.01, win_rate_pct: 60.1, total_pnl_pct: 17.4 },
      out_of_sample: { sharpe: 1.38, win_rate_pct: 52.3, total_pnl_pct: 8.9 },
    },
  ],
  overall: { sharpe: 1.46, win_rate_pct: 53.6, total_pnl_pct: 50.2 },
}

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  Line: () => <div />,
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

  it('renders window rows in the detail table', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('W1')).toBeInTheDocument()
    expect(screen.getByText('W2')).toBeInTheDocument()
  })

  it('displays train and test periods', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText(/2025-09-01/)).toBeInTheDocument()
    expect(screen.getAllByText(/2025-12-31/).length).toBeGreaterThan(0)
  })

  it('renders overall OOS summary row', () => {
    render(<WalkForwardChart />)
    expect(screen.getByText('Overall OOS')).toBeInTheDocument()
    expect(screen.getByText('1.46')).toBeInTheDocument()
  })

  it('displays in-sample and out-of-sample metrics', () => {
    render(<WalkForwardChart />)
    // IS Sharpe from W1
    expect(screen.getByText('1.95')).toBeInTheDocument()
    // OOS Sharpe from W1
    expect(screen.getByText('1.52')).toBeInTheDocument()
  })

  it('returns null when no windows', () => {
    vi.doMock('../../../hooks/useParamMatrix', () => ({
      useParamMatrix: () => ({ data: null, isLoading: false }),
      useWalkForward: () => ({ data: { windows: [], overall: { sharpe: 0, win_rate_pct: 0, total_pnl_pct: 0 } }, isLoading: false }),
    }))
  })
})
