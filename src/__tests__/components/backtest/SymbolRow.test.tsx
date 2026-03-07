/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SymbolRow from '../../../components/backtest/SymbolRow'
import type { SymbolBacktest } from '../../../types/backtest'

const makeRow = (overrides: Partial<SymbolBacktest> = {}): SymbolBacktest => ({
  config: 'A_current',
  trades: 20,
  win_rate_pct: 55,
  total_pnl_pct: 8.3,
  sharpe: 1.1,
  ...overrides,
})

describe('SymbolRow', () => {
  it('renders symbol name', () => {
    render(<SymbolRow symbol="BTCUSDT" rows={[makeRow()]} />)
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument()
  })

  it('does not show table when collapsed (default)', () => {
    render(<SymbolRow symbol="BTCUSDT" rows={[makeRow()]} />)
    expect(screen.queryByText('Config')).not.toBeInTheDocument()
  })

  it('expands to show table on click', async () => {
    const user = userEvent.setup()
    render(<SymbolRow symbol="BTCUSDT" rows={[makeRow()]} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Config')).toBeInTheDocument()
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('55.0%')).toBeInTheDocument()
    expect(screen.getByText('8.3%')).toBeInTheDocument()
    expect(screen.getByText('1.10')).toBeInTheDocument()
  })

  it('collapses again on second click', async () => {
    const user = userEvent.setup()
    render(<SymbolRow symbol="BTCUSDT" rows={[makeRow()]} />)
    const btn = screen.getByRole('button')
    await user.click(btn)
    expect(screen.getByText('Config')).toBeInTheDocument()
    await user.click(btn)
    expect(screen.queryByText('Config')).not.toBeInTheDocument()
  })

  it('renders multiple rows', async () => {
    const user = userEvent.setup()
    const rows = [
      makeRow({ config: 'A_current', total_pnl_pct: 5 }),
      makeRow({ config: 'B_pre_freeze', total_pnl_pct: -2.1 }),
    ]
    render(<SymbolRow symbol="ETHUSDT" rows={rows} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('B_pre_freeze')).toBeInTheDocument()
  })

  it('shows directional breakdown when long/short counts present', async () => {
    const user = userEvent.setup()
    const row = makeRow({ long_count: 10, long_pnl_pct: 3.5, short_count: 5, short_pnl_pct: -1.2 })
    render(<SymbolRow symbol="BTCUSDT" rows={[row]} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('×10')).toBeInTheDocument()
    expect(screen.getByText('×5')).toBeInTheDocument()
    expect(screen.getByText('3.5%')).toBeInTheDocument()
    expect(screen.getByText('-1.2%')).toBeInTheDocument()
  })

  it('hides directional breakdown when no long/short counts', async () => {
    const user = userEvent.setup()
    render(<SymbolRow symbol="BTCUSDT" rows={[makeRow()]} />)
    await user.click(screen.getByRole('button'))
    expect(screen.queryByText('LONG')).not.toBeInTheDocument()
    expect(screen.queryByText('SHORT')).not.toBeInTheDocument()
  })

  it('applies green for win rate >= 50 and red for < 50', async () => {
    const user = userEvent.setup()
    const rows = [
      makeRow({ config: 'A_current', win_rate_pct: 60 }),
      makeRow({ config: 'B_pre_freeze', win_rate_pct: 40 }),
    ]
    render(<SymbolRow symbol="BTCUSDT" rows={rows} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('60.0%').className).toContain('text-green-400')
    expect(screen.getByText('40.0%').className).toContain('text-red-400')
  })

  it('applies green for positive PnL and red for negative', async () => {
    const user = userEvent.setup()
    const rows = [
      makeRow({ config: 'A_current', total_pnl_pct: 10 }),
      makeRow({ config: 'B_pre_freeze', total_pnl_pct: -5 }),
    ]
    render(<SymbolRow symbol="BTCUSDT" rows={rows} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('10.0%').className).toContain('text-green-400')
    expect(screen.getByText('-5.0%').className).toContain('text-red-400')
  })

  it('handles empty rows array', async () => {
    const user = userEvent.setup()
    render(<SymbolRow symbol="BTCUSDT" rows={[]} />)
    await user.click(screen.getByRole('button'))
    // Table header renders, but no data rows
    expect(screen.getByText('Config')).toBeInTheDocument()
  })

  it('handles null/undefined optional fields gracefully', async () => {
    const user = userEvent.setup()
    const row = makeRow({ sharpe: undefined as unknown as number, win_rate_pct: undefined as unknown as number })
    render(<SymbolRow symbol="BTCUSDT" rows={[row]} />)
    await user.click(screen.getByRole('button'))
    // Should display with fallback 0 values
    expect(screen.getByText('0.0%')).toBeInTheDocument() // win_rate fallback
    expect(screen.getByText('0.00')).toBeInTheDocument() // sharpe fallback
  })
})
