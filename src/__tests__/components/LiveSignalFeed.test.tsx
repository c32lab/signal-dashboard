/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useRecentDecisions: vi.fn(),
}))

import LiveSignalFeed from '../../components/LiveSignalFeed'
import { useRecentDecisions } from '../../hooks/useApi'

const mockUseRecentDecisions = vi.mocked(useRecentDecisions)

function makeDecisions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    timestamp: `2026-03-07T0${i % 10}:00:00Z`,
    symbol: 'BTC/USDT',
    action: i % 2 === 0 ? 'LONG' : 'SHORT',
    direction: i % 2 === 0 ? 'LONG' : 'SHORT',
    confidence: 0.7 + (i % 3) * 0.1,
    decision_type: i % 2 === 0 ? 'FAST' : 'SLOW',
    combined_score: 0.5 + i * 0.01,
    reasoning: '',
    price_at_decision: 60000 + i * 100,
  }))
}

describe('LiveSignalFeed', () => {
  it('renders loading state', () => {
    mockUseRecentDecisions.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useRecentDecisions>)
    render(<LiveSignalFeed />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseRecentDecisions.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') } as unknown as ReturnType<typeof useRecentDecisions>)
    render(<LiveSignalFeed />)
    expect(screen.getByText('Failed to load signals')).toBeInTheDocument()
  })

  it('renders empty state (no signals)', () => {
    mockUseRecentDecisions.mockReturnValue({ data: { decisions: [], total: 0, limit: 60, offset: 0 }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useRecentDecisions>)
    render(<LiveSignalFeed />)
    expect(screen.getByText('No signals in the last hour')).toBeInTheDocument()
  })

  it('renders decision rows', () => {
    mockUseRecentDecisions.mockReturnValue({
      data: { decisions: makeDecisions(3), total: 3, limit: 60, offset: 0 },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useRecentDecisions>)
    render(<LiveSignalFeed />)
    expect(screen.getByText('3 signals in last 1h')).toBeInTheDocument()
    expect(screen.getByText('Live Signal Feed')).toBeInTheDocument()
  })

  it('collapse/expand toggle works', () => {
    mockUseRecentDecisions.mockReturnValue({
      data: { decisions: makeDecisions(2), total: 2, limit: 60, offset: 0 },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useRecentDecisions>)
    render(<LiveSignalFeed />)
    const collapseBtn = screen.getByText('▲ collapse')
    fireEvent.click(collapseBtn)
    expect(screen.getByText('▼ expand')).toBeInTheDocument()
    fireEvent.click(screen.getByText('▼ expand'))
    expect(screen.getByText('▲ collapse')).toBeInTheDocument()
  })

  it('renders signal count with correct plural', () => {
    mockUseRecentDecisions.mockReturnValue({
      data: { decisions: makeDecisions(1), total: 1, limit: 60, offset: 0 },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useRecentDecisions>)
    render(<LiveSignalFeed />)
    expect(screen.getByText('1 signal in last 1h')).toBeInTheDocument()
  })
})
