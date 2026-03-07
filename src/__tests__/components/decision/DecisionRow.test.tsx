/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../utils/format', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
  formatDateTime: (v: string) => v,
}))

vi.mock('../../../utils/dataValidation', () => ({
  validatePrice: () => ({ valid: true }),
  validateConfidence: () => ({ valid: true }),
}))

import { DecisionRow } from '../../../components/decision'
import type { Decision } from '../../../types'

const baseDecision: Decision = {
  id: 'abc123def',
  timestamp: '2026-03-07T01:00:00Z',
  symbol: 'BTC/USDT',
  action: 'LONG',
  direction: 'LONG',
  confidence: 0.85,
  decision_type: 'FAST',
  combined_score: 0.912,
  reasoning: 'Strong upward momentum',
  price_at_decision: 60000,
}

describe('DecisionRow', () => {
  it('renders symbol without /USDT', () => {
    const { container } = render(
      <table><tbody><DecisionRow d={baseDecision} /></tbody></table>
    )
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(container).toBeTruthy()
  })

  it('renders direction badge', () => {
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    const longs = screen.getAllByText('LONG')
    expect(longs.length).toBeGreaterThanOrEqual(1)
  })

  it('renders confidence as percentage (x100)', () => {
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText(/85%/)).toBeInTheDocument()
  })

  it('renders combined score with 3 decimal places', () => {
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText('0.912')).toBeInTheDocument()
  })

  it('renders reasoning text', () => {
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText('Strong upward momentum')).toBeInTheDocument()
  })

  it('renders truncated ID (last 6 chars)', () => {
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText('123def')).toBeInTheDocument()
  })

  it('renders dash when combined_score is not a number', () => {
    render(
      <table><tbody><DecisionRow d={{ ...baseDecision, combined_score: undefined as unknown as number }} /></tbody></table>
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders price', () => {
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText('$60000.00')).toBeInTheDocument()
  })

  it('renders FAST type badge', () => {
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText('FAST')).toBeInTheDocument()
  })
})
