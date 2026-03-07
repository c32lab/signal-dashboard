/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../utils/format', () => ({
  formatDateTime: vi.fn((ts: string) => `formatted:${ts}`),
  formatPrice: vi.fn((v: number) => `$${v}`),
}))

vi.mock('../../../components/timeline/ReasoningText', () => ({
  default: ({ text }: { text: string }) => <span data-testid="reasoning">{text}</span>,
}))

import TimelineCard from '../../../components/timeline/TimelineCard'
import type { Decision } from '../../../types'

const makeDecision = (overrides: Partial<Decision> = {}): Decision => ({
  id: '1',
  timestamp: '2026-03-08T10:00:00Z',
  symbol: 'BTC/USDT',
  action: 'OPEN',
  direction: 'LONG',
  confidence: 0.85,
  decision_type: 'FAST',
  combined_score: 7.5,
  reasoning: 'Strong momentum',
  price_at_decision: 65000,
  ...overrides,
})

describe('TimelineCard', () => {
  it('renders symbol with USDT stripped', () => {
    render(<TimelineCard decision={makeDecision()} />)
    expect(screen.getByText('BTC/')).toBeInTheDocument()
  })

  it('renders direction badge', () => {
    render(<TimelineCard decision={makeDecision({ direction: 'SHORT' })} />)
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })

  it('renders action', () => {
    render(<TimelineCard decision={makeDecision({ action: 'CLOSE' })} />)
    expect(screen.getByText('CLOSE')).toBeInTheDocument()
  })

  it('renders formatted timestamp', () => {
    render(<TimelineCard decision={makeDecision()} />)
    expect(screen.getByText('formatted:2026-03-08T10:00:00Z')).toBeInTheDocument()
  })

  it('renders confidence as percentage', () => {
    render(<TimelineCard decision={makeDecision({ confidence: 0.85 })} />)
    expect(screen.getByText('85.0%')).toBeInTheDocument()
  })

  it('renders combined score', () => {
    render(<TimelineCard decision={makeDecision({ combined_score: 7.5 })} />)
    expect(screen.getByText('7.50')).toBeInTheDocument()
  })

  it('renders formatted price', () => {
    render(<TimelineCard decision={makeDecision({ price_at_decision: 65000 })} />)
    expect(screen.getByText('$65000')).toBeInTheDocument()
  })

  it('renders reasoning text when present', () => {
    render(<TimelineCard decision={makeDecision({ reasoning: 'Test reason' })} />)
    expect(screen.getByTestId('reasoning')).toHaveTextContent('Test reason')
  })

  it('does not render reasoning when empty', () => {
    render(<TimelineCard decision={makeDecision({ reasoning: '' })} />)
    expect(screen.queryByTestId('reasoning')).not.toBeInTheDocument()
  })

  it('renders LONG with green border class', () => {
    const { container } = render(<TimelineCard decision={makeDecision({ direction: 'LONG' })} />)
    const card = container.querySelector('.border-l-4')
    expect(card?.className).toContain('border-l-green-500')
  })

  it('renders SHORT with red border class', () => {
    const { container } = render(<TimelineCard decision={makeDecision({ direction: 'SHORT' })} />)
    const card = container.querySelector('.border-l-4')
    expect(card?.className).toContain('border-l-red-500')
  })
})
