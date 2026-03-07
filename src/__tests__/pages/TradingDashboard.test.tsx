/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useTradingSummary: vi.fn(),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  Cell: () => <div />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
}))

vi.mock('../../utils/format', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
  formatTime: (v: string) => v,
  formatChartTime: (v: string) => v,
  formatDateTime: (v: string) => v,
}))

import TradingDashboard from '../../pages/TradingDashboard'
import { useTradingSummary } from '../../hooks/useApi'

const mockUseTradingSummary = vi.mocked(useTradingSummary)

describe('TradingDashboard', () => {
  it('renders page title', () => {
    mockUseTradingSummary.mockReturnValue({
      data: { balance: null, positions: [], recent_trades: [] },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    expect(screen.getByText('交易记录')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseTradingSummary.mockReturnValue({
      data: undefined, isLoading: false, error: new Error('API down'),
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    expect(screen.getByText(/API down/)).toBeInTheDocument()
  })

  it('renders with trading data', () => {
    mockUseTradingSummary.mockReturnValue({
      data: {
        balance: { total_usdt: 10000, unrealized_pnl: 250, available: 8000 },
        positions: [
          { symbol: 'BTC/USDT', side: 'LONG', size: 0.5, entry_price: 60000, unrealized_pnl: 250, leverage: 10 },
        ],
        recent_trades: [
          {
            id: 't1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
            side: 'LONG', entry_price: 60000, exit_price: 61000, size: 0.5,
            confidence: 0.85, pnl_usdt: 500, status: 'closed',
          },
        ],
      },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    expect(screen.getByText('交易记录')).toBeInTheDocument()
  })

  it('renders with empty trading data', () => {
    mockUseTradingSummary.mockReturnValue({
      data: { balance: null, positions: [], recent_trades: [] },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useTradingSummary>)
    render(<TradingDashboard />)
    expect(screen.getByText('交易记录')).toBeInTheDocument()
  })
})
