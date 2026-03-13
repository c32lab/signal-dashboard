/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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
    render(<OrderbookPanel />)
    expect(screen.getByText('Orderbook Signals')).toBeInTheDocument()
    expect(screen.getByText('Trade Flow (1min)')).toBeInTheDocument()
    expect(screen.getByText('Large Order Alerts')).toBeInTheDocument()
  })
})

describe('LargeOrderAlerts', () => {
  it('renders orders with correct columns', () => {
    render(<LargeOrderAlerts />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()
    expect(screen.getByText('Size')).toBeInTheDocument()
    // Check some mock data renders
    expect(screen.getAllByText('BTC').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ETH').length).toBeGreaterThan(0)
  })

  it('applies red styling for sigma >= 4', () => {
    const { container } = render(<LargeOrderAlerts />)
    const redRows = container.querySelectorAll('.bg-red-900\\/20')
    expect(redRows.length).toBeGreaterThan(0)
  })

  it('applies yellow styling for sigma >= 2 and < 4', () => {
    const { container } = render(<LargeOrderAlerts />)
    const yellowRows = container.querySelectorAll('.bg-yellow-900\\/20')
    expect(yellowRows.length).toBeGreaterThan(0)
  })
})
