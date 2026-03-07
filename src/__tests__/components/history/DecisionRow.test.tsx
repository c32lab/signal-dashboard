/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('../../../utils/dataValidation', () => ({
  validatePrice: vi.fn(() => ({ valid: true })),
  validateConfidence: vi.fn(() => ({ valid: true })),
}))

vi.mock('../../../components/DataWarning', () => ({
  default: ({ message }: { message: string }) => <span data-testid="data-warning">{message}</span>,
}))

import DecisionRow from '../../../components/history/DecisionRow'
import { validateConfidence } from '../../../utils/dataValidation'
import type { Decision } from '../../../types'

const baseDecision: Decision = {
  id: '1',
  timestamp: '2026-03-07T12:30:00Z',
  symbol: 'BTC/USDT',
  action: 'LONG',
  direction: 'LONG',
  confidence: 0.85,
  decision_type: 'FAST',
  combined_score: 0.512,
  reasoning: 'Bullish momentum',
  price_at_decision: 65000,
  raw_json: JSON.stringify({ suggested_stop_loss: 63000, suggested_take_profit: 70000 }),
}

function renderRow(d: Partial<Decision> = {}, isExpanded = false, onToggle = vi.fn()) {
  return render(
    <table><tbody>
      <DecisionRow d={{ ...baseDecision, ...d }} isExpanded={isExpanded} onToggle={onToggle} />
    </tbody></table>
  )
}

describe('DecisionRow', () => {
  it('renders basic decision data', () => {
    renderRow()
    expect(screen.getByText('BTC')).toBeInTheDocument()
    // LONG appears twice: action badge + direction badge
    expect(screen.getAllByText('LONG')).toHaveLength(2)
    expect(screen.getByText('FAST')).toBeInTheDocument()
    expect(screen.getByText('0.512')).toBeInTheDocument()
  })

  it('calls onToggle when row is clicked', () => {
    const onToggle = vi.fn()
    renderRow({}, false, onToggle)
    const row = screen.getByText('BTC').closest('tr')!
    fireEvent.click(row)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders DecisionDetail when expanded', () => {
    renderRow({}, true)
    // DecisionDetail renders from raw_json; since we have valid json it should render content
    expect(screen.queryByText('No detail data')).not.toBeInTheDocument()
  })

  it('does not render DecisionDetail when collapsed', () => {
    renderRow({}, false)
    // When collapsed, DecisionDetail is not rendered at all
    // The detail row should not exist
    const rows = document.querySelectorAll('tr')
    expect(rows).toHaveLength(1)
  })

  it('shows confidence warning when validateConfidence returns invalid', () => {
    vi.mocked(validateConfidence).mockReturnValue({ valid: false, warning: 'Confidence 1.5 out of 0-1 range' })
    renderRow({ confidence: 1.5 })
    expect(screen.getByTestId('data-warning')).toHaveTextContent('Confidence 1.5 out of 0-1 range')
    vi.mocked(validateConfidence).mockReturnValue({ valid: true })
  })

  it('shows confidence warning for zero confidence non-HOLD action', () => {
    vi.mocked(validateConfidence).mockReturnValue({ valid: true })
    renderRow({ confidence: 0, action: 'LONG' })
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByTestId('data-warning')).toHaveTextContent('Confidence=0 but action=LONG')
  })

  it('renders dash when direction is empty', () => {
    renderRow({ direction: '' })
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders dash when decision_type is empty', () => {
    renderRow({ decision_type: '' })
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders dash when confidence is not a number', () => {
    renderRow({ confidence: undefined as unknown as number })
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders dash when combined_score is not a number', () => {
    renderRow({ combined_score: undefined as unknown as number })
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders dash when price_at_decision is not a number', () => {
    renderRow({ price_at_decision: undefined as unknown as number })
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('renders SHORT action and direction', () => {
    renderRow({ action: 'SHORT', direction: 'SHORT' })
    expect(screen.getAllByText('SHORT')).toHaveLength(2)
  })
})
