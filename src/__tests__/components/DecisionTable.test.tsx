/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useDecisions: vi.fn(),
}))

vi.mock('../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT', 'ETH/USDT'],
}))

import DecisionTable from '../../components/DecisionTable'
import { useDecisions } from '../../hooks/useApi'

const mockUseDecisions = vi.mocked(useDecisions)

describe('DecisionTable', () => {
  it('renders loading state', () => {
    mockUseDecisions.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionTable />)
    expect(screen.getByText('Loading decisions…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseDecisions.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Network error') } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionTable />)
    expect(screen.getByText(/Failed to load decisions/)).toBeInTheDocument()
  })

  it('renders empty state when no decisions', () => {
    mockUseDecisions.mockReturnValue({
      data: { decisions: [], total: 0, limit: 20, offset: 0 },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionTable />)
    expect(screen.getByText('No decisions found')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    mockUseDecisions.mockReturnValue({
      data: { decisions: [], total: 0, limit: 20, offset: 0 },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionTable />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Direction')).toBeInTheDocument()
    expect(screen.getByText('Reasoning')).toBeInTheDocument()
  })

  it('renders decision rows', () => {
    mockUseDecisions.mockReturnValue({
      data: {
        decisions: [
          {
            id: 'abc123', timestamp: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT',
            action: 'LONG', direction: 'LONG', confidence: 0.85,
            decision_type: 'FAST', combined_score: 0.9, reasoning: 'Strong momentum',
            price_at_decision: 60000,
          },
        ],
        total: 1, limit: 20, offset: 0,
      },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionTable />)
    // BTC appears in both the symbol filter and the table row
    const btcElements = screen.getAllByText('BTC')
    expect(btcElements.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Strong momentum')).toBeInTheDocument()
  })
})
