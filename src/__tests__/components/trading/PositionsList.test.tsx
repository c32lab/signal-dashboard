/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PositionsList from '../../../components/trading/PositionsList'
import type { TradingPosition } from '../../../types/trading'

const makePosition = (overrides: Partial<TradingPosition> = {}): TradingPosition => ({
  symbol: 'BTCUSDT',
  side: 'LONG',
  size: 0.5,
  entry_price: 42000,
  unrealized_pnl: 150.25,
  leverage: 10,
  ...overrides,
})

describe('PositionsList', () => {
  it('shows loading skeleton when isLoading is true', () => {
    const { container } = render(<PositionsList positions={[]} isLoading={true} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('shows empty state when no positions', () => {
    render(<PositionsList positions={[]} isLoading={false} />)
    expect(screen.getByText('No open positions')).toBeInTheDocument()
  })

  it('renders section heading', () => {
    render(<PositionsList positions={[]} isLoading={false} />)
    expect(screen.getByText('持仓')).toBeInTheDocument()
  })

  it('renders position card with details', () => {
    const pos = makePosition()
    render(<PositionsList positions={[pos]} isLoading={false} />)
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('0.5')).toBeInTheDocument()
    expect(screen.getByText('$42,000.00')).toBeInTheDocument()
    expect(screen.getByText('+150.25')).toBeInTheDocument()
    expect(screen.getByText('10x')).toBeInTheDocument()
  })

  it('renders multiple positions', () => {
    const positions = [
      makePosition({ symbol: 'BTCUSDT' }),
      makePosition({ symbol: 'ETHUSDT', side: 'SHORT', entry_price: 2500 }),
    ]
    render(<PositionsList positions={positions} isLoading={false} />)
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument()
    expect(screen.getByText('ETHUSDT')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })

  it('shows labels for position fields', () => {
    render(<PositionsList positions={[makePosition()]} isLoading={false} />)
    expect(screen.getByText('Entry Price')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
    expect(screen.getByText('Unrealized PnL')).toBeInTheDocument()
    expect(screen.getByText('Leverage')).toBeInTheDocument()
  })

  it('shows negative PnL with red color', () => {
    const pos = makePosition({ unrealized_pnl: -50.3 })
    render(<PositionsList positions={[pos]} isLoading={false} />)
    const pnlEl = screen.getByText('-50.30')
    expect(pnlEl.className).toContain('text-red-400')
  })

  it('hides leverage row when leverage is null', () => {
    const pos = makePosition({ leverage: null as unknown as number })
    render(<PositionsList positions={[pos]} isLoading={false} />)
    expect(screen.queryByText('Leverage')).not.toBeInTheDocument()
  })
})
