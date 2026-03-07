/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../components/history/useTraderHistory', () => ({
  useTraderHistory: vi.fn(),
}))

vi.mock('../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT'],
}))

import TraderHistory from '../../pages/TraderHistory'
import { useTraderHistory } from '../../components/history/useTraderHistory'

const mockUseTraderHistory = vi.mocked(useTraderHistory)

function mockReturnValues(overrides = {}) {
  mockUseTraderHistory.mockReturnValue({
    symbolFilter: '', actionFilter: '', directionFilter: '', typeFilter: '',
    timePeriod: '', exporting: false,
    handleSymbol: vi.fn(), handleAction: vi.fn(), handleDirection: vi.fn(),
    handleType: vi.fn(), handleExport: vi.fn(),
    setTimePeriod: vi.fn(),
    decisions: [], total: 0, isLoading: false, error: undefined,
    overall: undefined, activeSignals: null, perfData: undefined, typeOptions: [],
    offset: 0, setOffset: vi.fn(),
    startRecord: 0, endRecord: 0, currentPage: 1, totalPages: 1,
    isDirectionFiltered: false,
    ...overrides,
  })
}

describe('TraderHistory', () => {
  it('renders KPI cards section', () => {
    mockReturnValues()
    render(<TraderHistory />)
    expect(screen.getByText('Total Trades')).toBeInTheDocument()
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
  })

  it('renders loading state in decision table', () => {
    mockReturnValues({ isLoading: true })
    render(<TraderHistory />)
    expect(screen.getByText('Loading decisions…')).toBeInTheDocument()
  })

  it('renders error state in decision table', () => {
    mockReturnValues({ error: new Error('API error') })
    render(<TraderHistory />)
    expect(screen.getByText(/Failed to load decisions/)).toBeInTheDocument()
  })

  it('renders empty state when no decisions', () => {
    mockReturnValues()
    render(<TraderHistory />)
    expect(screen.getByText('No decisions found')).toBeInTheDocument()
  })

  it('renders with overall data', () => {
    mockReturnValues({
      overall: { total: 100, accuracy_pct: 55, avg_pnl_pct: 2.3 },
      activeSignals: 5,
    })
    render(<TraderHistory />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not render pagination when no data', () => {
    mockReturnValues({ total: 0 })
    render(<TraderHistory />)
    // Pagination should not appear
    expect(screen.queryByText(/of/)).toBeNull()
  })
})
