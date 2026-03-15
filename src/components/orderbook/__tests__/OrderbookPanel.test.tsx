/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUseOrderbookLargeOrders = vi.fn()
const mockUseOrderbookFlow = vi.fn()
const mockUseOrderbookCvd = vi.fn()

vi.mock('../../../hooks/useApi', () => ({
  useOrderbookLargeOrders: (...args: unknown[]) => mockUseOrderbookLargeOrders(...args),
  useOrderbookFlow: (...args: unknown[]) => mockUseOrderbookFlow(...args),
  useOrderbookCvd: (...args: unknown[]) => mockUseOrderbookCvd(...args),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div data-testid="composed-chart">{children}</div>,
  Bar: () => <div />,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  CartesianGrid: () => <div />,
  Legend: () => <div />,
}))

import OrderbookPanel from '../OrderbookPanel'
import LargeOrderAlerts from '../LargeOrderAlerts'

describe('OrderbookPanel', () => {
  it('renders without crashing', () => {
    mockUseOrderbookFlow.mockReturnValue({ data: undefined, error: undefined, isLoading: false })
    mockUseOrderbookLargeOrders.mockReturnValue({ data: undefined, error: undefined, isLoading: false })
    mockUseOrderbookCvd.mockReturnValue({ data: undefined, error: undefined, isLoading: false })
    render(<OrderbookPanel />)
    expect(screen.getByText('Orderbook Signals')).toBeInTheDocument()
    expect(screen.getByText('Trade Flow (1min)')).toBeInTheDocument()
    expect(screen.getByText('Large Order Alerts')).toBeInTheDocument()
  })
})

describe('LargeOrderAlerts', () => {
  it('renders orders with correct columns', () => {
    mockUseOrderbookLargeOrders.mockReturnValue({
      data: {
        symbol: 'BTCUSDT',
        large_orders: [
          { timestamp: '2026-03-15T10:00:00Z', side: 'buy', qty: 1, price: 97000, z_score: 5.0, severity: 'extreme' },
          { timestamp: '2026-03-15T09:50:00Z', side: 'sell', qty: 0.5, price: 3800, z_score: 3.0, severity: 'significant' },
        ],
        stats: { count_2sigma: 2, count_4sigma: 1, net_large_volume: 50000 },
      },
      error: undefined,
      isLoading: false,
    })
    render(<LargeOrderAlerts />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
  })

  it('applies red styling for sigma >= 4', () => {
    mockUseOrderbookLargeOrders.mockReturnValue({
      data: {
        symbol: 'BTCUSDT',
        large_orders: [
          { timestamp: '2026-03-15T10:00:00Z', side: 'buy', qty: 1, price: 97000, z_score: 5.0, severity: 'extreme' },
        ],
        stats: { count_2sigma: 1, count_4sigma: 1, net_large_volume: 97000 },
      },
      error: undefined,
      isLoading: false,
    })
    const { container } = render(<LargeOrderAlerts />)
    const redRows = container.querySelectorAll('.bg-red-900\\/20')
    expect(redRows.length).toBeGreaterThan(0)
  })

  it('applies yellow styling for sigma >= 2 and < 4', () => {
    mockUseOrderbookLargeOrders.mockReturnValue({
      data: {
        symbol: 'BTCUSDT',
        large_orders: [
          { timestamp: '2026-03-15T10:00:00Z', side: 'sell', qty: 0.5, price: 3800, z_score: 3.0, severity: 'significant' },
        ],
        stats: { count_2sigma: 1, count_4sigma: 0, net_large_volume: 1900 },
      },
      error: undefined,
      isLoading: false,
    })
    const { container } = render(<LargeOrderAlerts />)
    const yellowRows = container.querySelectorAll('.bg-yellow-900\\/20')
    expect(yellowRows.length).toBeGreaterThan(0)
  })

  it('shows empty state when API unavailable', () => {
    mockUseOrderbookLargeOrders.mockReturnValue({ data: undefined, error: undefined, isLoading: false })
    render(<LargeOrderAlerts />)
    expect(screen.getByText(/Large order alerts not available/)).toBeInTheDocument()
  })
})
