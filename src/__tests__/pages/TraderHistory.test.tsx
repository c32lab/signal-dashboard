/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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

  it('renders pagination and handles prev/next clicks', () => {
    const mockSetOffset = vi.fn()
    mockReturnValues({
      total: 150,
      offset: 50,
      startRecord: 51,
      endRecord: 100,
      currentPage: 2,
      totalPages: 3,
      setOffset: mockSetOffset,
    })
    render(<TraderHistory />)

    // Both buttons should be enabled on middle page
    const prevButton = screen.getByText(/‹ Prev/)
    fireEvent.click(prevButton)
    expect(mockSetOffset).toHaveBeenCalledTimes(1)

    const nextButton = screen.getByText(/Next ›/)
    fireEvent.click(nextButton)
    expect(mockSetOffset).toHaveBeenCalledTimes(2)
  })

  it('shows SymbolSummary when symbolFilter and perfData are set', () => {
    mockReturnValues({
      symbolFilter: 'BTC/USDT',
      perfData: {
        by_symbol: [
          { symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: 60, avg_pnl_pct: 2.3 },
        ],
      },
    })
    render(<TraderHistory />)
    // SymbolSummary shows "BTC Performance" via stripUsdt
    expect(screen.getByText(/BTC Performance/)).toBeInTheDocument()
  })
})
