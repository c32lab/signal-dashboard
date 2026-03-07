/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrendsSection } from '../../../components/predict/TrendsSection'
import type { Trend } from '../../../types/predict'

function makeTrend(overrides: Partial<Trend> = {}): Trend {
  return {
    pattern_name: 'etf_inflow_spike',
    event_count: 5,
    avg_impact: 2.3,
    symbols: ['BTC/USDT', 'ETH/USDT'],
    latest_date: '2026-03-06',
    window_hours: 72,
    ...overrides,
  }
}

describe('TrendsSection', () => {
  it('renders empty state', () => {
    render(<TrendsSection trends={[]} />)
    expect(screen.getByText('No trends discovered yet')).toBeInTheDocument()
  })

  it('renders trends cards with pattern name', () => {
    render(<TrendsSection trends={[makeTrend(), makeTrend({ pattern_name: 'whale_move' })]} />)
    expect(screen.getByText('etf_inflow_spike')).toBeInTheDocument()
    expect(screen.getByText('whale_move')).toBeInTheDocument()
  })

  it('renders event count and avg impact', () => {
    render(<TrendsSection trends={[makeTrend({ event_count: 8, avg_impact: 4.7 })]} />)
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('4.7%')).toBeInTheDocument()
  })

  it('renders symbol badges', () => {
    render(<TrendsSection trends={[makeTrend({ symbols: ['SOL/USDT'] })]} />)
    expect(screen.getByText('SOL/USDT')).toBeInTheDocument()
  })

  it('renders latest date', () => {
    render(<TrendsSection trends={[makeTrend({ latest_date: '2026-03-05' })]} />)
    expect(screen.getByText('Latest: 2026-03-05')).toBeInTheDocument()
  })
})
