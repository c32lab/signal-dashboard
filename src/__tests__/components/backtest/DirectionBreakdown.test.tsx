/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DirectionBreakdown from '../../../components/backtest/DirectionBreakdown'
import type { BacktestSummary } from '../../../types/backtest'

function makeSummary(overrides: Partial<BacktestSummary> = {}): BacktestSummary {
  return {
    config: 'baseline',
    total_trades: 100,
    win_rate_pct: 55,
    total_pnl_pct: 12.5,
    sharpe: 1.2,
    max_drawdown_pct: 8.3,
    long_count: 60,
    long_wins: 35,
    long_pnl_pct: 8.0,
    short_count: 40,
    short_wins: 20,
    short_pnl_pct: 4.5,
    ...overrides,
  }
}

describe('DirectionBreakdown', () => {
  it('renders a card for each config in summary', () => {
    const summary = [
      makeSummary({ config: 'baseline' }),
      makeSummary({ config: 'aggressive' }),
    ]
    render(<DirectionBreakdown summary={summary} />)
    expect(screen.getByText('baseline')).toBeInTheDocument()
    expect(screen.getByText('aggressive')).toBeInTheDocument()
  })

  it('shows LONG count, win rate, PnL for each config', () => {
    const summary = [makeSummary({ config: 'baseline', long_count: 60, long_wins: 35, long_pnl_pct: 8.0 })]
    render(<DirectionBreakdown summary={summary} />)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('×60')).toBeInTheDocument()
    // win rate = 35/60*100 = 58.3%
    expect(screen.getByText('WR 58.3%')).toBeInTheDocument()
    expect(screen.getByText('+8.0%')).toBeInTheDocument()
  })

  it('shows SHORT count, win rate, PnL for each config', () => {
    const summary = [makeSummary({ config: 'baseline', short_count: 40, short_wins: 20, short_pnl_pct: -3.2 })]
    render(<DirectionBreakdown summary={summary} />)
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('×40')).toBeInTheDocument()
    // win rate = 20/40*100 = 50.0%
    expect(screen.getByText('WR 50.0%')).toBeInTheDocument()
    expect(screen.getByText('-3.2%')).toBeInTheDocument()
  })

  it('handles missing long_wins/short_wins gracefully', () => {
    const summary = [makeSummary({
      config: 'no-wins-data',
      long_count: 10,
      long_wins: undefined,
      short_count: 5,
      short_wins: undefined,
    })]
    render(<DirectionBreakdown summary={summary} />)
    // Should show dash for unknown win rates
    const dashes = screen.getAllByText('WR —')
    expect(dashes).toHaveLength(2)
  })

  it('returns null for empty summary', () => {
    const { container } = render(<DirectionBreakdown summary={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('filters out entries with no long or short counts', () => {
    const summary = [
      makeSummary({ config: 'no-direction', long_count: 0, short_count: 0 }),
      makeSummary({ config: 'has-direction', long_count: 5, short_count: 3 }),
    ]
    render(<DirectionBreakdown summary={summary} />)
    expect(screen.queryByText('no-direction')).not.toBeInTheDocument()
    expect(screen.getByText('has-direction')).toBeInTheDocument()
  })
})
