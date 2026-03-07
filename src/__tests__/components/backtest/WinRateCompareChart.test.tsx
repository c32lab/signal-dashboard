/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="chart-bar" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import WinRateCompareChart from '../../../components/backtest/WinRateCompareChart'
import type { SymbolBacktest, BacktestConfig } from '../../../types/backtest'

const configs: Record<string, BacktestConfig> = {
  A_current: { weights: { momentum: 0.4 }, description: 'Current' },
  B_test: { weights: { momentum: 0.7 }, description: 'Test' },
}

const bySymbol: Record<string, SymbolBacktest[]> = {
  BTCUSDT: [
    { config: 'A_current', trades: 20, win_rate_pct: 55, total_pnl_pct: 5.0, sharpe: 1.2 },
    { config: 'B_test', trades: 18, win_rate_pct: 60, total_pnl_pct: 6.0, sharpe: 1.4 },
  ],
  ETHUSDT: [
    { config: 'A_current', trades: 15, win_rate_pct: 50, total_pnl_pct: 3.0, sharpe: 0.9 },
    { config: 'B_test', trades: 12, win_rate_pct: 52, total_pnl_pct: 2.5, sharpe: 0.8 },
  ],
}

describe('WinRateCompareChart', () => {
  it('renders chart with title', () => {
    render(<WinRateCompareChart bySymbol={bySymbol} configs={configs} />)
    expect(screen.getByText('Win Rate by Symbol')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders bars for each config', () => {
    render(<WinRateCompareChart bySymbol={bySymbol} configs={configs} />)
    const bars = screen.getAllByTestId('chart-bar')
    expect(bars).toHaveLength(2) // one Bar per config
  })

  it('handles empty bySymbol data', () => {
    render(<WinRateCompareChart bySymbol={{}} configs={configs} />)
    expect(screen.getByText('Win Rate by Symbol')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('handles empty configs', () => {
    render(<WinRateCompareChart bySymbol={{}} configs={{}} />)
    expect(screen.getByText('Win Rate by Symbol')).toBeInTheDocument()
  })
})
