/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../utils/format', () => ({
  formatPrice: (v: number) => `$${v.toFixed(2)}`,
  formatDateTime: (v: string) => v,
}))

const mockValidatePrice = vi.fn(() => ({ valid: true }))
const mockValidateConfidence = vi.fn(() => ({ valid: true }))

vi.mock('../../../utils/dataValidation', () => ({
  validatePrice: (...args: unknown[]) => mockValidatePrice(...args),
  validateConfidence: (...args: unknown[]) => mockValidateConfidence(...args),
}))

vi.mock('../../../components/DataWarning', () => ({
  default: ({ message }: { message: string }) => <span data-testid="data-warning">{message}</span>,
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
  beforeEach(() => {
    mockValidatePrice.mockReturnValue({ valid: true })
    mockValidateConfidence.mockReturnValue({ valid: true })
  })

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

  it('renders dash when decision_type is missing', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, decision_type: '' }} /></tbody></table>)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders dash when price_at_decision is not a number', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, price_at_decision: undefined as unknown as number }} /></tbody></table>)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders SHORT direction badge', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, direction: 'SHORT' }} /></tbody></table>)
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })

  it('renders HOLD direction badge', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, direction: 'HOLD', action: 'HOLD' }} /></tbody></table>)
    expect(screen.getAllByText('HOLD').length).toBeGreaterThanOrEqual(1)
  })

  it('renders with zero confidence for non-HOLD action', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, confidence: 0, action: 'LONG' }} /></tbody></table>)
    expect(screen.getByText(/0%/)).toBeInTheDocument()
  })

  it('shows DataWarning when validatePrice returns invalid', () => {
    mockValidatePrice.mockReturnValue({ valid: false, warning: 'Price out of range' })
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText('Price out of range')).toBeInTheDocument()
  })

  it('shows DataWarning when validateConfidence returns invalid', () => {
    mockValidateConfidence.mockReturnValue({ valid: false, warning: 'Confidence out of 0-1 range' })
    render(<table><tbody><DecisionRow d={baseDecision} /></tbody></table>)
    expect(screen.getByText('Confidence out of 0-1 range')).toBeInTheDocument()
  })

  it('shows zero confidence warning for non-HOLD action', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, confidence: 0, action: 'LONG' }} /></tbody></table>)
    expect(screen.getByText('Confidence=0 but action=LONG')).toBeInTheDocument()
  })

  it('does not show zero confidence warning for HOLD action', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, confidence: 0, action: 'HOLD' }} /></tbody></table>)
    expect(screen.queryByText(/Confidence=0/)).not.toBeInTheDocument()
  })

  it('renders SLOW type badge', () => {
    render(<table><tbody><DecisionRow d={{ ...baseDecision, decision_type: 'SLOW' }} /></tbody></table>)
    expect(screen.getByText('SLOW')).toBeInTheDocument()
  })
})
