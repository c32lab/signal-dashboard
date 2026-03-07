/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TradingSummary } from '../../types/trading'

// Mock hooks
vi.mock('../../hooks/useApi', () => ({
  useTradingSummary: vi.fn(),
}))

// Mock recharts — render children only
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

import TradingDashboard from '../../pages/TradingDashboard'
import { useTradingSummary } from '../../hooks/useApi'

const mockUseTradingSummary = vi.mocked(useTradingSummary)

function makeSummary(overrides?: Partial<TradingSummary>): TradingSummary {
  return {
    balance: { total_usdt: 10000, unrealized_pnl: 150, available: 8000 },
    positions: [],
    recent_trades: [],
    ...overrides,
  }
}

describe('TradingDashboard', () => {
  it('renders loading skeleton pulses', () => {
    mockUseTradingSummary.mockReturnValue({
      data: undefined, isLoading: true, error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    expect(screen.getByText('交易记录')).toBeInTheDocument()
    // loading pulse divs should exist
    const pulses = document.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('renders error state', () => {
    mockUseTradingSummary.mockReturnValue({
      data: undefined, isLoading: false, error: new Error('Network fail'),
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    expect(screen.getByText(/加载失败/)).toBeInTheDocument()
    expect(screen.getByText(/Network fail/)).toBeInTheDocument()
  })

  it('renders balance cards and trade stats with data', () => {
    mockUseTradingSummary.mockReturnValue({
      data: makeSummary({
        recent_trades: [
          { id: '1', timestamp: '2026-01-01T00:00:00Z', symbol: 'BTCUSDT', side: 'LONG', entry_price: 50000, exit_price: 51000, size: 1, confidence: 0.8, pnl_usdt: 100, status: 'closed' },
          { id: '2', timestamp: '2026-01-02T00:00:00Z', symbol: 'ETHUSDT', side: 'SHORT', entry_price: 3000, exit_price: null, size: 2, confidence: 0.6, pnl_usdt: null, status: 'open' },
        ],
      }),
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    // Balance card labels
    expect(screen.getByText('总余额 (USDT)')).toBeInTheDocument()
    expect(screen.getByText('未实现盈亏')).toBeInTheDocument()
    expect(screen.getByText('可用余额 (USDT)')).toBeInTheDocument()
    // Trade stats
    expect(screen.getByText('总交易数')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // total trades
  })

  it('shows "No open positions" when positions empty', () => {
    mockUseTradingSummary.mockReturnValue({
      data: makeSummary(),
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    expect(screen.getByText('No open positions')).toBeInTheDocument()
  })
})
