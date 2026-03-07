/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SymbolTableSection from '../../../components/backtest/SymbolTableSection'

const bySymbol = {
  'BTC/USDT': [{ config: 'A', trades: 50, win_rate_pct: 60, total_pnl_pct: 15, sharpe: 1.5 }],
  'ETH/USDT': [{ config: 'A', trades: 30, win_rate_pct: 55, total_pnl_pct: 8, sharpe: 1.2 }],
}

describe('SymbolTableSection', () => {
  it('renders symbol count', () => {
    render(<SymbolTableSection bySymbol={bySymbol} page={1} onPageChange={() => {}} />)
    expect(screen.getByText('(2 symbols)')).toBeInTheDocument()
  })

  it('renders By Symbol heading', () => {
    render(<SymbolTableSection bySymbol={bySymbol} page={1} onPageChange={() => {}} />)
    expect(screen.getByText('By Symbol')).toBeInTheDocument()
  })

  it('renders nothing when no symbols', () => {
    const { container } = render(<SymbolTableSection bySymbol={{}} page={1} onPageChange={() => {}} />)
    expect(container.innerHTML).toBe('')
  })

  it('calls onPageChange when clicking pagination', async () => {
    const symbols: Record<string, typeof bySymbol['BTC/USDT']> = {}
    for (let i = 0; i < 25; i++) {
      symbols[`SYM${i}`] = [{ config: 'A', trades: 10, win_rate_pct: 50, total_pnl_pct: 0, sharpe: 0 }]
    }
    const onPageChange = vi.fn()
    render(<SymbolTableSection bySymbol={symbols} page={1} onPageChange={onPageChange} />)

    const user = userEvent.setup()
    await user.click(screen.getByText('Next →'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
