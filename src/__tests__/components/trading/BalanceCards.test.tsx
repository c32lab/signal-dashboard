/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BalanceCards from '../../../components/trading/BalanceCards'
import type { TradingBalance } from '../../../types/trading'

const balance: TradingBalance = {
  total_usdt: 10000.5,
  unrealized_pnl: 250.75,
  available: 8500.25,
}

describe('BalanceCards', () => {
  it('shows loading skeleton when isLoading is true', () => {
    const { container } = render(<BalanceCards balance={null} isLoading={true} />)
    const pulseEls = container.querySelectorAll('.animate-pulse')
    expect(pulseEls.length).toBe(3)
  })

  it('renders balance values', () => {
    render(<BalanceCards balance={balance} isLoading={false} />)
    expect(screen.getByText('$10,000.50')).toBeInTheDocument()
    expect(screen.getByText('+250.75')).toBeInTheDocument()
    expect(screen.getByText('$8,500.25')).toBeInTheDocument()
  })

  it('renders labels', () => {
    render(<BalanceCards balance={balance} isLoading={false} />)
    expect(screen.getByText('总余额 (USDT)')).toBeInTheDocument()
    expect(screen.getByText('未实现盈亏')).toBeInTheDocument()
    expect(screen.getByText('可用余额 (USDT)')).toBeInTheDocument()
  })

  it('shows green for positive unrealized PnL', () => {
    render(<BalanceCards balance={balance} isLoading={false} />)
    const pnlEl = screen.getByText('+250.75')
    expect(pnlEl.className).toContain('text-green-400')
  })

  it('shows red for negative unrealized PnL', () => {
    const negBalance: TradingBalance = { ...balance, unrealized_pnl: -100.5 }
    render(<BalanceCards balance={negBalance} isLoading={false} />)
    const pnlEl = screen.getByText('-100.50')
    expect(pnlEl.className).toContain('text-red-400')
  })

  it('handles null balance with fallback zeros', () => {
    render(<BalanceCards balance={null} isLoading={false} />)
    const zeroUsdElements = screen.getAllByText('$0.00')
    expect(zeroUsdElements.length).toBe(2) // total + available
    expect(screen.getByText('+0.00')).toBeInTheDocument()
  })

  it('handles undefined balance with fallback zeros', () => {
    render(<BalanceCards balance={undefined} isLoading={false} />)
    const zeroElements = screen.getAllByText('$0.00')
    expect(zeroElements.length).toBe(2)
  })
})
