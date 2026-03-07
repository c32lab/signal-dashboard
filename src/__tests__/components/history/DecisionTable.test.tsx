/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Decision } from '../../../types'

// We need to mock SectionErrorBoundary since it wraps the component
import HistoryDecisionTable from '../../../components/history/DecisionTable'

function makeDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    id: 'test-id-1',
    timestamp: '2026-03-07T01:00:00Z',
    symbol: 'BTC/USDT',
    action: 'LONG',
    direction: 'LONG',
    confidence: 0.85,
    decision_type: 'FAST',
    combined_score: 0.9,
    reasoning: 'Strong momentum',
    price_at_decision: 60000,
    ...overrides,
  }
}

describe('History DecisionTable', () => {
  it('renders loading state', () => {
    render(<HistoryDecisionTable decisions={[]} isLoading={true} error={null} />)
    expect(screen.getByText('Loading decisions…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    render(<HistoryDecisionTable decisions={[]} isLoading={false} error={new Error('API error')} />)
    expect(screen.getByText(/Failed to load decisions/)).toBeInTheDocument()
    expect(screen.getByText(/API error/)).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<HistoryDecisionTable decisions={[]} isLoading={false} error={null} />)
    expect(screen.getByText('No decisions found')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<HistoryDecisionTable decisions={[makeDecision()]} isLoading={false} error={null} />)
    expect(screen.getByText('Time')).toBeInTheDocument()
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('SL')).toBeInTheDocument()
    expect(screen.getByText('TP')).toBeInTheDocument()
  })

  it('renders decision rows', () => {
    render(<HistoryDecisionTable decisions={[makeDecision()]} isLoading={false} error={null} />)
    expect(screen.getByText('Strong momentum')).toBeInTheDocument()
  })

  it('handles non-Error error objects', () => {
    render(<HistoryDecisionTable decisions={[]} isLoading={false} error="String error" />)
    expect(screen.getByText(/String error/)).toBeInTheDocument()
  })
})
