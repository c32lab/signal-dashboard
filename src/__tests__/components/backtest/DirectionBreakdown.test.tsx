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

  it('shows red win rate when LONG win rate < 50', () => {
    const summary = [makeSummary({ config: 'test', long_count: 10, long_wins: 3, long_pnl_pct: -2.0 })]
    render(<DirectionBreakdown summary={summary} />)
    const wrEl = screen.getByText('WR 30.0%')
    expect(wrEl.className).toContain('text-red-400')
  })

  it('shows red win rate when SHORT win rate < 50', () => {
    const summary = [makeSummary({ config: 'test', short_count: 10, short_wins: 2, short_pnl_pct: -1.0 })]
    render(<DirectionBreakdown summary={summary} />)
    const wrEls = screen.getAllByText(/WR/)
    const shortWr = wrEls.find(el => el.textContent === 'WR 20.0%')
    expect(shortWr?.className).toContain('text-red-400')
  })

  it('shows negative PnL in red for LONG', () => {
    const summary = [makeSummary({ config: 'test', long_count: 10, long_wins: 7, long_pnl_pct: -5.0 })]
    render(<DirectionBreakdown summary={summary} />)
    expect(screen.getByText('-5.0%')).toBeInTheDocument()
  })

  it('shows negative PnL in red for SHORT', () => {
    const summary = [makeSummary({ config: 'test', short_count: 10, short_wins: 7, short_pnl_pct: -3.0 })]
    render(<DirectionBreakdown summary={summary} />)
    expect(screen.getByText('-3.0%')).toBeInTheDocument()
  })

  it('uses fallback CONFIG_COLORS for unknown config name', () => {
    const summary = [makeSummary({ config: 'unknown_config_xyz', long_count: 5, short_count: 3 })]
    const { container } = render(<DirectionBreakdown summary={summary} />)
    const dot = container.querySelector('[style*="background-color"]') as HTMLElement
    expect(dot?.style.backgroundColor).toBe('rgb(156, 163, 175)')
  })

  it('handles zero long/short counts for ratio bar', () => {
    const summary = [makeSummary({ config: 'test', long_count: 0, short_count: 5 })]
    render(<DirectionBreakdown summary={summary} />)
    expect(screen.getByText('×0')).toBeInTheDocument()
  })
})
