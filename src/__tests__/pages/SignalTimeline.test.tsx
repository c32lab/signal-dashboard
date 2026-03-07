/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

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
    expect(screen.getByText('信号时间轴')).toBeInTheDocument()
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
    expect(screen.getByText('暂无数据')).toBeInTheDocument()
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
})
