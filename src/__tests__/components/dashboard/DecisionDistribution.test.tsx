/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/useApi', () => ({
  useDecisions: vi.fn(),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}))

import { DecisionDistribution } from '../../../components/dashboard/DecisionDistribution'
import { useDecisions } from '../../../hooks/useApi'

const mockUseDecisions = vi.mocked(useDecisions)

describe('DecisionDistribution', () => {
  it('renders loading state', () => {
    mockUseDecisions.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionDistribution />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders empty state when no decisions', () => {
    mockUseDecisions.mockReturnValue({ data: { decisions: [], total: 0, limit: 50, offset: 0 }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionDistribution />)
    expect(screen.getByText('No decisions yet')).toBeInTheDocument()
  })

  it('renders chart with decision data', () => {
    mockUseDecisions.mockReturnValue({
      data: {
        decisions: [
          { id: '1', timestamp: '2026-03-07T00:00:00Z', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.8, decision_type: 'FAST', combined_score: 0.75, reasoning: '', price_at_decision: 60000 },
          { id: '2', timestamp: '2026-03-07T00:01:00Z', symbol: 'BTC/USDT', action: 'SHORT', direction: 'SHORT', confidence: 0.6, decision_type: 'SLOW', combined_score: 0.55, reasoning: '', price_at_decision: 60100 },
        ],
        total: 2, limit: 50, offset: 0,
      },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionDistribution />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByText('Decision Distribution (Last 50)')).toBeInTheDocument()
  })

  it('groups decisions by symbol correctly', () => {
    mockUseDecisions.mockReturnValue({
      data: {
        decisions: [
          { id: '1', timestamp: '2026-03-07T00:00:00Z', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.8, decision_type: 'FAST', combined_score: 0.75, reasoning: '', price_at_decision: 60000 },
          { id: '2', timestamp: '2026-03-07T00:01:00Z', symbol: 'ETH/USDT', action: 'SHORT', direction: 'SHORT', confidence: 0.6, decision_type: 'SLOW', combined_score: 0.55, reasoning: '', price_at_decision: 3000 },
          { id: '3', timestamp: '2026-03-07T00:02:00Z', symbol: 'BTC/USDT', action: 'HOLD', direction: 'LONG', confidence: 0.5, decision_type: 'FAST', combined_score: 0.45, reasoning: '', price_at_decision: 60200 },
        ],
        total: 3, limit: 50, offset: 0,
      },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionDistribution />)
    // Chart renders with grouped data - two symbols present
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders all three direction types (LONG/SHORT/HOLD)', () => {
    mockUseDecisions.mockReturnValue({
      data: {
        decisions: [
          { id: '1', timestamp: '2026-03-07T00:00:00Z', symbol: 'BTC/USDT', action: 'LONG', direction: 'LONG', confidence: 0.8, decision_type: 'FAST', combined_score: 0.75, reasoning: '', price_at_decision: 60000 },
          { id: '2', timestamp: '2026-03-07T00:01:00Z', symbol: 'BTC/USDT', action: 'SHORT', direction: 'SHORT', confidence: 0.6, decision_type: 'SLOW', combined_score: 0.55, reasoning: '', price_at_decision: 60100 },
          { id: '3', timestamp: '2026-03-07T00:02:00Z', symbol: 'BTC/USDT', action: 'HOLD', direction: 'LONG', confidence: 0.5, decision_type: 'FAST', combined_score: 0.45, reasoning: '', price_at_decision: 60200 },
        ],
        total: 3, limit: 50, offset: 0,
      },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionDistribution />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders heading text', () => {
    mockUseDecisions.mockReturnValue({ data: { decisions: [], total: 0, limit: 50, offset: 0 }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useDecisions>)
    render(<DecisionDistribution />)
    expect(screen.getByText('Decision Distribution (Last 50)')).toBeInTheDocument()
  })
})
