/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Decision } from '../../../types'

// Mock DecisionRow to simplify testing
vi.mock('../../../components/history/DecisionRow', () => ({
  default: ({ d, isExpanded, onToggle }: { d: Decision; isExpanded: boolean; onToggle: () => void }) => (
    <tr data-testid={`row-${d.id}`} data-expanded={isExpanded} onClick={onToggle}>
      <td>{d.symbol}</td>
    </tr>
  ),
}))

// Mock SectionErrorBoundary to pass through children
vi.mock('../../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}))

import DecisionTable from '../../../components/history/DecisionTable'

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: '1',
  timestamp: '2026-03-07T12:00:00Z',
  symbol: 'BTC/USDT',
  action: 'LONG',
  direction: 'LONG',
  confidence: 0.85,
  decision_type: 'FAST',
  combined_score: 0.5,
  reasoning: 'test',
  price_at_decision: 65000,
  ...overrides,
})

describe('DecisionTable', () => {
  it('renders table headers', () => {
    render(<DecisionTable decisions={[]} isLoading={false} error={null} />)
    const expectedHeaders = ['Time', 'Symbol', 'Action', 'Dir', 'Type', 'Conf', 'Score', 'Price', 'SL', 'TP', 'Reasoning']
    for (const h of expectedHeaders) {
      expect(screen.getByText(h)).toBeInTheDocument()
    }
  })

  it('renders decision rows', () => {
    const decisions = [
      makeDecision({ id: '1', symbol: 'BTC/USDT' }),
      makeDecision({ id: '2', symbol: 'ETH/USDT' }),
    ]
    render(<DecisionTable decisions={decisions} isLoading={false} error={null} />)
    expect(screen.getByTestId('row-1')).toBeInTheDocument()
    expect(screen.getByTestId('row-2')).toBeInTheDocument()
  })

  it('shows "No decisions found" when decisions is empty', () => {
    render(<DecisionTable decisions={[]} isLoading={false} error={null} />)
    expect(screen.getByText('No decisions found')).toBeInTheDocument()
  })

  it('shows loading message when isLoading is true', () => {
    render(<DecisionTable decisions={[]} isLoading={true} error={null} />)
    expect(screen.getByText('Loading decisions…')).toBeInTheDocument()
  })

  it('shows error message when error is provided', () => {
    render(<DecisionTable decisions={[]} isLoading={false} error={new Error('Network failure')} />)
    expect(screen.getByText(/Network failure/)).toBeInTheDocument()
  })

  it('toggles expanded row on click', () => {
    const decisions = [
      makeDecision({ id: '10' }),
      makeDecision({ id: '20' }),
    ]
    render(<DecisionTable decisions={decisions} isLoading={false} error={null} />)

    const row10 = screen.getByTestId('row-10')
    expect(row10).toHaveAttribute('data-expanded', 'false')

    // Click to expand
    fireEvent.click(row10)
    expect(screen.getByTestId('row-10')).toHaveAttribute('data-expanded', 'true')
    expect(screen.getByTestId('row-20')).toHaveAttribute('data-expanded', 'false')

    // Click same row to collapse
    fireEvent.click(screen.getByTestId('row-10'))
    expect(screen.getByTestId('row-10')).toHaveAttribute('data-expanded', 'false')
  })
})
