/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SensitivityAnalysis from '../../../components/backtest/SensitivityAnalysis'
import type { BacktestConfig, BacktestSummary } from '../../../types/backtest'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Cell: () => <div />,
}))

const configs: Record<string, BacktestConfig> = {
  A_current: { weights: { technical: 0.4, derivatives: 0.3, sentiment: 0.3 }, description: 'Current' },
  B_pre_freeze: { weights: { technical: 0.6, derivatives: 0.2, sentiment: 0.2 }, description: 'Pre-freeze' },
}

const summaries: BacktestSummary[] = [
  { config: 'A_current', total_trades: 100, win_rate_pct: 55, total_pnl_pct: 12.5, sharpe: 1.8, max_drawdown_pct: 8.2 },
  { config: 'B_pre_freeze', total_trades: 80, win_rate_pct: 48, total_pnl_pct: -3.2, sharpe: 0.9, max_drawdown_pct: 15.1 },
]

describe('SensitivityAnalysis', () => {
  it('renders heading', () => {
    render(<SensitivityAnalysis configs={configs} summary={summaries} />)
    expect(screen.getByText('Sensitivity Analysis')).toBeInTheDocument()
  })

  it('renders a sub-chart for each weight source', () => {
    render(<SensitivityAnalysis configs={configs} summary={summaries} />)
    expect(screen.getByText('derivatives')).toBeInTheDocument()
    expect(screen.getByText('sentiment')).toBeInTheDocument()
    expect(screen.getByText('technical')).toBeInTheDocument()
  })

  it('returns null when no configs have weights', () => {
    const { container } = render(<SensitivityAnalysis configs={{}} summary={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when summary is empty', () => {
    const { container } = render(<SensitivityAnalysis configs={configs} summary={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('handles configs with different weight sources', () => {
    const mixed: Record<string, BacktestConfig> = {
      A_current: { weights: { rsi: 0.5 }, description: 'A' },
      B_pre_freeze: { weights: { macd: 0.3 }, description: 'B' },
    }
    render(<SensitivityAnalysis configs={mixed} summary={summaries} />)
    expect(screen.getByText('macd')).toBeInTheDocument()
    expect(screen.getByText('rsi')).toBeInTheDocument()
  })
})
