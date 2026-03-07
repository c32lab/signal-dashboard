/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RegimeMiniCard from '../../../components/backtest/RegimeMiniCard'
import type { BacktestSummary } from '../../../types/backtest'

function makeSummary(overrides: Partial<BacktestSummary> = {}): BacktestSummary {
  return {
    config: 'A_current',
    total_trades: 10,
    win_rate_pct: 55,
    total_pnl_pct: 5.0,
    sharpe: 1.0,
    max_drawdown_pct: 3.0,
    ...overrides,
  }
}

describe('RegimeMiniCard', () => {
  it('shows "No data" when summaries have zero total trades', () => {
    render(<RegimeMiniCard regime="trending" summaries={[makeSummary({ total_trades: 0 })]} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('calculates and displays average Win Rate and PnL', () => {
    const summaries = [
      makeSummary({ win_rate_pct: 60, total_pnl_pct: 10, total_trades: 5 }),
      makeSummary({ win_rate_pct: 40, total_pnl_pct: -4, total_trades: 5 }),
    ]
    render(<RegimeMiniCard regime="trending" summaries={summaries} />)
    // avg win rate = (60+40)/2 = 50.0%
    expect(screen.getByText('50.0%')).toBeInTheDocument()
    // avg pnl = (10 + -4)/2 = 3.0%
    expect(screen.getByText('3.0%')).toBeInTheDocument()
    // total trades = 10
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('displays regime name in uppercase', () => {
    render(<RegimeMiniCard regime="trending" summaries={[makeSummary()]} />)
    const label = screen.getByText('trending')
    expect(label.className).toContain('uppercase')
  })

  it('shows green for win rate >= 50 and red for < 50', () => {
    const { rerender } = render(
      <RegimeMiniCard regime="trending" summaries={[makeSummary({ win_rate_pct: 55 })]} />
    )
    expect(screen.getByText('55.0%').className).toContain('text-green-400')

    rerender(
      <RegimeMiniCard regime="trending" summaries={[makeSummary({ win_rate_pct: 30 })]} />
    )
    expect(screen.getByText('30.0%').className).toContain('text-red-400')
  })
})
