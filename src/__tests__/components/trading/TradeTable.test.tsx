/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TradeTable from '../../../components/trading/TradeTable'
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

describe('TradeTable', () => {
  it('shows loading state', () => {
    render(<TradeTable trades={[]} isLoading={true} />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows empty state when no trades', () => {
    render(<TradeTable trades={[]} isLoading={false} />)
    expect(screen.getByText('No trades')).toBeInTheDocument()
  })

  it('renders trade rows', () => {
    const trades = [makeTrade()]
    render(<TradeTable trades={trades} isLoading={false} />)
    // Symbol appears in both dropdown option and table cell
    expect(screen.getAllByText('BTCUSDT').length).toBeGreaterThanOrEqual(2)
    // LONG appears in both dropdown option and badge
    expect(screen.getAllByText('LONG').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('shows dash for null exit price', () => {
    const trades = [makeTrade({ exit_price: null })]
    render(<TradeTable trades={trades} isLoading={false} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<TradeTable trades={[makeTrade()]} isLoading={false} />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('PnL (USDT)')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('filters by symbol', async () => {
    const user = userEvent.setup()
    const trades = [
      makeTrade({ id: '1', symbol: 'BTCUSDT' }),
      makeTrade({ id: '2', symbol: 'ETHUSDT' }),
    ]
    render(<TradeTable trades={trades} isLoading={false} />)

    const symbolSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(symbolSelect, 'BTCUSDT')
    // ETHUSDT still exists in dropdown option, but should not be in table body
    const ethElements = screen.getAllByText('ETHUSDT')
    // Only 1 instance (dropdown option), not 2 (dropdown + table cell)
    expect(ethElements.length).toBe(1)
  })

  it('filters by side', async () => {
    const user = userEvent.setup()
    const trades = [
      makeTrade({ id: '1', side: 'LONG', symbol: 'AAAUSDT' }),
      makeTrade({ id: '2', side: 'SHORT', symbol: 'BBBUSDT' }),
    ]
    render(<TradeTable trades={trades} isLoading={false} />)

    const sideSelect = screen.getAllByRole('combobox')[1]
    await user.selectOptions(sideSelect, 'SHORT')
    // BBBUSDT should have 2 instances (dropdown + table), AAAUSDT only 1 (dropdown)
    expect(screen.getAllByText('BBBUSDT').length).toBe(2)
    expect(screen.getAllByText('AAAUSDT').length).toBe(1)
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    const trades = [
      makeTrade({ id: '1', status: 'open', symbol: 'AAAUSDT', exit_price: null, pnl_usdt: null }),
      makeTrade({ id: '2', status: 'closed', symbol: 'BBBUSDT' }),
    ]
    render(<TradeTable trades={trades} isLoading={false} />)

    const statusSelect = screen.getAllByRole('combobox')[2]
    await user.selectOptions(statusSelect, 'open')
    // Only the open trade (AAAUSDT) should appear in table
    expect(screen.getAllByText('AAAUSDT').length).toBe(2) // dropdown + table
    expect(screen.getAllByText('BBBUSDT').length).toBe(1) // dropdown only
  })

  it('shows pagination when trades exceed page size', () => {
    const trades = Array.from({ length: 20 }, (_, i) =>
      makeTrade({ id: String(i), symbol: `SYM${i}` })
    )
    render(<TradeTable trades={trades} isLoading={false} />)
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1-15 of 20')).toBeInTheDocument()
  })

  it('navigates pages', async () => {
    const user = userEvent.setup()
    const trades = Array.from({ length: 20 }, (_, i) =>
      makeTrade({ id: String(i), symbol: `SYM${i}` })
    )
    render(<TradeTable trades={trades} isLoading={false} />)

    await user.click(screen.getByText('Next'))
    expect(screen.getByText('16-20 of 20')).toBeInTheDocument()

    await user.click(screen.getByText('Prev'))
    expect(screen.getByText('1-15 of 20')).toBeInTheDocument()
  })

  it('hides pagination when trades fit in one page', () => {
    const trades = [makeTrade()]
    render(<TradeTable trades={trades} isLoading={false} />)
    expect(screen.queryByText('Prev')).not.toBeInTheDocument()
  })
})
