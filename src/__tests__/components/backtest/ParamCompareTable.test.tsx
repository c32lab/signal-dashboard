/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ParamCompareTable from '../../../components/backtest/ParamCompareTable'
import type { BacktestConfig, BacktestSummary } from '../../../types/backtest'

const configs: Record<string, BacktestConfig> = {
  A_current: { weights: { momentum: 0.4, mean_rev: 0.6 }, description: 'Current' },
  B_test: { weights: { momentum: 0.7, mean_rev: 0.3 }, description: 'Test' },
}

const makeSummary = (overrides: Partial<BacktestSummary> = {}): BacktestSummary => ({
  config: 'A_current',
  win_rate_pct: 55,
  total_pnl_pct: 12.5,
  sharpe: 1.23,
  max_drawdown_pct: 8.4,
  total_trades: 42,
  win_count: 23,
  loss_count: 19,
  ...overrides,
})

const summaryA = makeSummary({ config: 'A_current', win_rate_pct: 55, total_pnl_pct: 12.5, sharpe: 1.23, max_drawdown_pct: 8.4, total_trades: 42 })
const summaryB = makeSummary({ config: 'B_test', win_rate_pct: 60, total_pnl_pct: 10.0, sharpe: 1.1, max_drawdown_pct: 5.0, total_trades: 38 })

describe('ParamCompareTable', () => {
  it('renders all metric rows', () => {
    render(<ParamCompareTable configs={configs} summary={[summaryA]} />)
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('Total PnL%')).toBeInTheDocument()
    expect(screen.getByText('Sharpe')).toBeInTheDocument()
    expect(screen.getByText('Max DD%')).toBeInTheDocument()
    expect(screen.getByText('Trades')).toBeInTheDocument()
    expect(screen.getByText('Win Count')).toBeInTheDocument()
    expect(screen.getByText('Loss Count')).toBeInTheDocument()
  })

  it('renders config columns in header', () => {
    render(<ParamCompareTable configs={configs} summary={[summaryA, summaryB]} />)
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('B_test')).toBeInTheDocument()
  })

  it('formats metric values correctly', () => {
    render(<ParamCompareTable configs={configs} summary={[summaryA]} />)
    expect(screen.getByText('55.0%')).toBeInTheDocument()    // Win Rate
    expect(screen.getByText('12.50%')).toBeInTheDocument()   // Total PnL% (2 decimals)
    expect(screen.getByText('1.23')).toBeInTheDocument()     // Sharpe
    expect(screen.getByText('8.4%')).toBeInTheDocument()     // Max DD%
    expect(screen.getByText('42')).toBeInTheDocument()       // Trades
  })

  it('highlights best values with green bold when multiple configs', () => {
    render(<ParamCompareTable configs={configs} summary={[summaryA, summaryB]} />)
    // B_test has higher win rate (60%), should be highlighted
    const winRateCells = screen.getAllByText('60.0%')
    expect(winRateCells[0].className).toContain('text-green-400')
    expect(winRateCells[0].className).toContain('font-bold')

    // A_current has lower win rate (55%), should NOT be highlighted
    const lowerWinRate = screen.getByText('55.0%')
    expect(lowerWinRate.className).not.toContain('font-bold')
  })

  it('highlights min value as best for Max DD%', () => {
    render(<ParamCompareTable configs={configs} summary={[summaryA, summaryB]} />)
    // B_test has lower max DD (5.0%), should be highlighted for min metric
    const ddCell = screen.getByText('5.0%')
    expect(ddCell.className).toContain('text-green-400')
    expect(ddCell.className).toContain('font-bold')
  })

  it('returns null when summary is empty', () => {
    const { container } = render(<ParamCompareTable configs={configs} summary={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders weights row with weight keys and values', () => {
    render(<ParamCompareTable configs={configs} summary={[summaryA]} />)
    expect(screen.getByText('Weights')).toBeInTheDocument()
    expect(screen.getByText(/momentum/)).toBeInTheDocument()
    expect(screen.getByText(/mean_rev/)).toBeInTheDocument()
  })
})
