/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useSignalsLatest: vi.fn(),
}))

vi.mock('../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
}))

import SignalCards from '../../components/SignalCards'
import { useSignalsLatest } from '../../hooks/useApi'

const mockUseSignalsLatest = vi.mocked(useSignalsLatest)

describe('SignalCards', () => {
  it('renders loading state', () => {
    mockUseSignalsLatest.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<SignalCards />)
    expect(screen.getByText('Loading signals…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseSignalsLatest.mockReturnValue({ data: undefined, isLoading: false, error: new Error('API error') } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<SignalCards />)
    expect(screen.getByText(/Failed to load signals/)).toBeInTheDocument()
  })

  it('renders signal cards for each symbol', () => {
    mockUseSignalsLatest.mockReturnValue({
      data: [
        { id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.85, decision_type: 'FAST', combined_score: 0.9, reasoning: '', price_at_decision: 60000 },
        { id: '2', timestamp: '2026-03-07T01:00:00Z', symbol: 'ETH/USDT', action: 'SHORT', direction: 'SHORT', confidence: 0.65, decision_type: 'SLOW', combined_score: 0.7, reasoning: '', price_at_decision: 3000 },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<SignalCards />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('SOL')).toBeInTheDocument()
    // SOL has no data, should show N/A
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('renders confidence percentage correctly (×100)', () => {
    mockUseSignalsLatest.mockReturnValue({
      data: [
        { id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.85, decision_type: 'FAST', combined_score: 0.9, reasoning: '', price_at_decision: 60000 },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<SignalCards />)
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('renders direction badge for LONG', () => {
    mockUseSignalsLatest.mockReturnValue({
      data: [
        { id: '1', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.9, decision_type: 'FAST', combined_score: 0.9, reasoning: '', price_at_decision: 60000 },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<SignalCards />)
    const badge = screen.getByText('LONG')
    expect(badge.className).toContain('bg-green-900')
  })
})
