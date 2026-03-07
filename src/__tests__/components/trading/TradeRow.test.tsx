/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TradeRow from '../../../components/trading/TradeRow'
import type { TradingTrade } from '../../../types/trading'

const makeTrade = (overrides: Partial<TradingTrade> = {}): TradingTrade => ({
  id: '1',
  timestamp: '2025-01-15T10:30:00Z',
  symbol: 'BTCUSDT',
  side: 'LONG',
  entry_price: 42000,
  exit_price: 43000,
  size: 0.1,
  confidence: 0.85,
  pnl_usdt: 100,
  status: 'closed',
  ...overrides,
})

function renderRow(trade: TradingTrade) {
  return render(
    <table><tbody><TradeRow trade={trade} /></tbody></table>
  )
}

describe('TradeRow', () => {
  it('renders symbol and confidence', () => {
    renderRow(makeTrade())
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('shows dash for null exit price', () => {
    renderRow(makeTrade({ exit_price: null }))
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders side badge', () => {
    renderRow(makeTrade({ side: 'SHORT' }))
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })
})
