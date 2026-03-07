/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PatternCard } from '../../components/predict/PatternCard'
import type { Pattern } from '../../types/predict'

function makePattern(overrides: Partial<Pattern> = {}): Pattern {
  return {
    id: 1,
    name: 'Bull Divergence',
    direction: 'UP',
    avg_impact: 3.5,
    base_level: 2,
    keywords: [],
    boost_keywords: [],
    example_dates: ['2026-01-01', '2026-01-15', '2026-02-01'],
    notes: '',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('PatternCard', () => {
  it('renders pattern name and direction badge', () => {
    render(<PatternCard pattern={makePattern()} />)
    expect(screen.getByText('Bull Divergence')).toBeInTheDocument()
    expect(screen.getByText('UP')).toBeInTheDocument()
  })

  it('UP/LONG direction shows green styling', () => {
    render(<PatternCard pattern={makePattern({ direction: 'LONG' })} />)
    const badge = screen.getByText('LONG')
    expect(badge.className).toContain('bg-green-900')
    expect(badge.className).toContain('text-green-300')
  })

  it('DOWN/SHORT direction shows red styling', () => {
    render(<PatternCard pattern={makePattern({ direction: 'SHORT' })} />)
    const badge = screen.getByText('SHORT')
    expect(badge.className).toContain('bg-red-900')
    expect(badge.className).toContain('text-red-300')
  })

  it('renders avg_impact as percentage (already_pct, no ×100)', () => {
    render(<PatternCard pattern={makePattern({ avg_impact: 3.5 })} />)
    // Should display 3.5%, NOT 350%
    expect(screen.getByText('3.5%')).toBeInTheDocument()
  })

  it('renders base_level', () => {
    render(<PatternCard pattern={makePattern({ base_level: 4 })} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renders example_dates (max 3)', () => {
    const dates = ['2026-01-01', '2026-01-15', '2026-02-01', '2026-03-01']
    render(<PatternCard pattern={makePattern({ example_dates: dates })} />)
    expect(screen.getByText('Examples: 2026-01-01, 2026-01-15, 2026-02-01')).toBeInTheDocument()
    // 4th date should not appear
    expect(screen.queryByText(/2026-03-01/)).not.toBeInTheDocument()
  })

  it('handles null avg_impact with "—"', () => {
    render(<PatternCard pattern={makePattern({ avg_impact: null as unknown as number })} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
