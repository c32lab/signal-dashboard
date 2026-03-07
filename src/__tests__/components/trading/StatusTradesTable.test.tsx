/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../utils/format', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
  formatTime: (v: string) => v,
}))

import StatusTradesTable from '../../../components/trading/StatusTradesTable'
import type { TradingTrade } from '../../../types/trading'

const sampleTrades: TradingTrade[] = [
  {
    id: 't1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
    side: 'LONG', entry_price: 60000, exit_price: 61000, size: 0.5,
    confidence: 0.85, pnl_usdt: 500, status: 'closed',
  },
  {
    id: 't2', timestamp: '2026-03-07T02:00:00Z', symbol: 'ETH/USDT',
    side: 'SHORT', entry_price: 3000, exit_price: null, size: 2.0,
    confidence: 0.7, pnl_usdt: null, status: 'open',
  },
]

describe('StatusTradesTable', () => {
  it('renders empty state when no trades', () => {
    render(<StatusTradesTable trades={[]} />)
    expect(screen.getByText('No recent trades')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<StatusTradesTable trades={sampleTrades} />)
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Entry')).toBeInTheDocument()
    expect(screen.getByText('Exit')).toBeInTheDocument()
    expect(screen.getByText('Conf')).toBeInTheDocument()
    expect(screen.getByText('PnL')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders trade symbols without USDT', () => {
    render(<StatusTradesTable trades={sampleTrades} />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('renders confidence as percentage', () => {
    render(<StatusTradesTable trades={sampleTrades} />)
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
  })

  it('renders dash for null exit_price and null pnl', () => {
    render(<StatusTradesTable trades={sampleTrades} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders status badges', () => {
    render(<StatusTradesTable trades={sampleTrades} />)
    expect(screen.getByText('closed')).toBeInTheDocument()
    expect(screen.getByText('open')).toBeInTheDocument()
  })

  it('renders PnL with sign for closed trades', () => {
    render(<StatusTradesTable trades={sampleTrades} />)
    expect(screen.getByText('+$500.00')).toBeInTheDocument()
  })

  it('limits to 10 trades', () => {
    const manyTrades = Array.from({ length: 15 }, (_, i) => ({
      ...sampleTrades[0],
      id: `t${i}`,
    }))
    render(<StatusTradesTable trades={manyTrades} />)
    const rows = screen.getAllByText('BTC')
    expect(rows.length).toBe(10)
  })
})
