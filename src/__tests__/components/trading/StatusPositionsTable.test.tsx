/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../utils/format', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
}))

import StatusPositionsTable from '../../../components/trading/StatusPositionsTable'
import type { TradingPosition } from '../../../types/trading'

const samplePositions: TradingPosition[] = [
  { symbol: 'BTC/USDT', side: 'LONG', size: 0.5, entry_price: 60000, unrealized_pnl: 250, leverage: 10 },
  { symbol: 'ETH/USDT', side: 'SHORT', size: 2.0, entry_price: 3000, unrealized_pnl: -50, leverage: 5 },
]

describe('StatusPositionsTable', () => {
  it('renders empty state when no positions', () => {
    render(<StatusPositionsTable positions={[]} />)
    expect(screen.getByText('No open positions')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<StatusPositionsTable positions={samplePositions} />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
    expect(screen.getByText('Entry Price')).toBeInTheDocument()
    expect(screen.getByText('Unrealized PnL')).toBeInTheDocument()
    expect(screen.getByText('Leverage')).toBeInTheDocument()
  })

  it('renders position symbols without USDT', () => {
    render(<StatusPositionsTable positions={samplePositions} />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('renders side badges', () => {
    render(<StatusPositionsTable positions={samplePositions} />)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })

  it('renders leverage with x suffix', () => {
    render(<StatusPositionsTable positions={samplePositions} />)
    expect(screen.getByText('10x')).toBeInTheDocument()
    expect(screen.getByText('5x')).toBeInTheDocument()
  })

  it('shows positive PnL with plus sign', () => {
    render(<StatusPositionsTable positions={samplePositions} />)
    expect(screen.getByText('+$250.00')).toBeInTheDocument()
  })

  it('shows negative PnL', () => {
    render(<StatusPositionsTable positions={samplePositions} />)
    expect(screen.getByText('$-50.00')).toBeInTheDocument()
  })
})
