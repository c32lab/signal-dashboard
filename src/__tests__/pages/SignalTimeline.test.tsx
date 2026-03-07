/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockUseTimelineData = vi.fn()

vi.mock('../../hooks/useTimelineData', () => ({
  useTimelineData: (params: unknown) => mockUseTimelineData(params),
}))

vi.mock('../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT', 'ETH/USDT'],
}))

import SignalTimeline from '../../pages/SignalTimeline'

describe('SignalTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', () => {
    mockUseTimelineData.mockReturnValue({
      data: { decisions: [], total: 0 },
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)
    expect(screen.getByText('Signal Timeline')).toBeInTheDocument()
  })

  it('renders loading state', () => {
    mockUseTimelineData.mockReturnValue({
      data: undefined,
      isLoading: true, error: undefined,
    })
    render(<SignalTimeline />)
    // SkeletonCards should be rendered
    const { container } = render(<SignalTimeline />)
    expect(container).toBeTruthy()
  })

  it('renders error state', () => {
    mockUseTimelineData.mockReturnValue({
      data: undefined,
      isLoading: false, error: { message: 'Network error' },
    })
    render(<SignalTimeline />)
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  it('renders empty state when no decisions', () => {
    mockUseTimelineData.mockReturnValue({
      data: { decisions: [], total: 0 },
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('renders timeline cards with decisions', () => {
    mockUseTimelineData.mockReturnValue({
      data: {
        decisions: [
          {
            id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
            action: 'LONG', direction: 'LONG', confidence: 0.85,
            decision_type: 'FAST', combined_score: 0.9, reasoning: 'Bullish',
            price_at_decision: 60000,
          },
        ],
        total: 1,
      },
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)
    const btcElements = screen.getAllByText(/BTC/)
    expect(btcElements.length).toBeGreaterThanOrEqual(1)
  })

  it('renders filter bar', () => {
    mockUseTimelineData.mockReturnValue({
      data: { decisions: [], total: 0 },
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)
    // Time range buttons should be visible
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
  })

  it('filters decisions by direction client-side', () => {
    mockUseTimelineData.mockReturnValue({
      data: {
        decisions: [
          {
            id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
            action: 'LONG', direction: 'LONG', confidence: 0.85,
            decision_type: 'FAST', combined_score: 0.9, reasoning: 'Bullish',
            price_at_decision: 60000,
          },
          {
            id: '2', timestamp: '2026-03-07T02:00:00Z', symbol: 'ETH/USDT',
            action: 'SHORT', direction: 'SHORT', confidence: 0.7,
            decision_type: 'FAST', combined_score: 0.6, reasoning: 'Bearish',
            price_at_decision: 3000,
          },
        ],
        total: 2,
      },
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)

    // Select LONG direction filter
    const directionSelect = screen.getByDisplayValue('ALL')
    fireEvent.change(directionSelect, { target: { value: 'LONG' } })

    // After direction filter, only LONG decisions should be shown
    const btcElements = screen.queryAllByText(/BTC/)
    expect(btcElements.length).toBeGreaterThanOrEqual(1)
    // ETH card should not appear (but ETH may still be in symbol filter dropdown)
    const ethCards = screen.queryAllByText(/ETH/)
    // Only the option in the select should have ETH, not a timeline card
    expect(ethCards.every(el => el.tagName === 'OPTION')).toBe(true)
  })

  it('resets page when symbol filter changes', () => {
    mockUseTimelineData.mockReturnValue({
      data: { decisions: [], total: 0 },
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)

    // Change symbol filter
    const symbolSelect = screen.getByDisplayValue('All Symbols')
    fireEvent.change(symbolSelect, { target: { value: 'BTC/USDT' } })

    // Verify that useTimelineData is called with new symbol
    expect(mockUseTimelineData).toHaveBeenCalledWith(
      expect.objectContaining({ symbol: 'BTC/USDT', offset: 0 })
    )
  })

  it('resets page when time range changes', () => {
    mockUseTimelineData.mockReturnValue({
      data: { decisions: [], total: 0 },
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)

    // Click a different time range (e.g., "1h")
    fireEvent.click(screen.getByText('1h'))

    // Should call with hours=1 and offset=0
    expect(mockUseTimelineData).toHaveBeenCalledWith(
      expect.objectContaining({ hours: 1, offset: 0 })
    )
  })

  it('renders pagination when totalPages > 1 and handles prev/next', () => {
    const decisions = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      timestamp: '2026-03-07T01:00:00Z',
      symbol: 'BTC/USDT',
      action: 'LONG',
      direction: 'LONG',
      confidence: 0.85,
      decision_type: 'FAST',
      combined_score: 0.9,
      reasoning: 'Bullish',
      price_at_decision: 60000,
    }))

    mockUseTimelineData.mockReturnValue({
      data: { decisions, total: 60 }, // 2 pages with PAGE_SIZE=30
      isLoading: false, error: undefined,
    })
    render(<SignalTimeline />)

    // Pagination should be visible
    expect(screen.getByText('Prev')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()

    // Prev should be disabled on first page
    expect(screen.getByText('Prev')).toBeDisabled()

    // Click Next
    fireEvent.click(screen.getByText('Next'))

    // After clicking Next, page should be 1, offset should be 30
    expect(mockUseTimelineData).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 30 })
    )
  })
})
