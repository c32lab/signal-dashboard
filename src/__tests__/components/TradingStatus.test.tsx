/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useTradingSummary: vi.fn(),
}))

vi.mock('../../utils/format', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
  formatTime: (v: string) => v,
}))

import TradingStatus from '../../components/TradingStatus'
import { useTradingSummary } from '../../hooks/useApi'
import type { TradingSummary } from '../../types/trading'

const mockUseTradingSummary = vi.mocked(useTradingSummary)

const baseSummary: TradingSummary = {
  balance: { total_usdt: 10000, unrealized_pnl: 250, available: 8000 },
  positions: [],
  recent_trades: [],
}

describe('TradingStatus', () => {
  it('renders loading state', () => {
    mockUseTradingSummary.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingStatus />)
    expect(screen.getByText('Loading trading status…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseTradingSummary.mockReturnValue({ data: undefined, isLoading: false, error: new Error('API down') } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingStatus />)
    expect(screen.getByText(/Failed to load trading status/)).toBeInTheDocument()
    expect(screen.getByText(/API down/)).toBeInTheDocument()
  })

  it('renders balance cards', () => {
    mockUseTradingSummary.mockReturnValue({
      data: baseSummary,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingStatus />)
    expect(screen.getByText('Total Balance')).toBeInTheDocument()
    expect(screen.getByText('Unrealized PnL')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('$10000.00')).toBeInTheDocument()
  })

  it('renders positions table with data', () => {
    mockUseTradingSummary.mockReturnValue({
      data: {
        ...baseSummary,
        positions: [
          { symbol: 'BTC/USDT', side: 'LONG' as const, size: 0.01, entry_price: 60000, unrealized_pnl: 150, leverage: 10 },
        ],
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingStatus />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('10x')).toBeInTheDocument()
  })

  it('renders "No open positions" when positions array is empty', () => {
    mockUseTradingSummary.mockReturnValue({
      data: baseSummary,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingStatus />)
    expect(screen.getByText('No open positions')).toBeInTheDocument()
  })

  it('renders recent trades table', () => {
    mockUseTradingSummary.mockReturnValue({
      data: {
        ...baseSummary,
        recent_trades: [
          { id: 't1', timestamp: '2026-03-07T00:00:00Z', symbol: 'ETH/USDT', side: 'SHORT' as const, entry_price: 3000, exit_price: 2900, size: 0.5, confidence: 0.85, pnl_usdt: 50, status: 'closed' as const },
        ],
      },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingStatus />)
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('closed')).toBeInTheDocument()
  })

  it('renders TESTNET badge', () => {
    mockUseTradingSummary.mockReturnValue({
      data: baseSummary,
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingStatus />)
    expect(screen.getByText('TESTNET')).toBeInTheDocument()
  })
})
