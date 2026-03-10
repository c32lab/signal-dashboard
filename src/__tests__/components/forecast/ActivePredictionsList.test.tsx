/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ActivePredictionsList from '../../../components/forecast/ActivePredictionsList'
import type { ForecastPrediction } from '../../../types'

const mockPredictions: ForecastPrediction[] = [
  { id: 1, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.78, trigger_pattern: 'institutional_inflow', trigger_event: 'Test event 1', expected_impact: 2.3, expected_horizon: '1d', timestamp: '2026-03-10T08:30:00Z' },
  { id: 2, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.65, trigger_pattern: 'macro_positive', trigger_event: 'Test event 2', expected_impact: 1.8, expected_horizon: '3d', timestamp: '2026-03-10T07:15:00Z' },
  { id: 3, symbol: 'SOL/USDT', direction: 'SHORT', confidence: 0.62, trigger_pattern: 'whale_movement', trigger_event: 'Test event 3', expected_impact: -1.5, expected_horizon: '1d', timestamp: '2026-03-10T06:45:00Z' },
]

describe('ActivePredictionsList', () => {
  it('renders the header with count', () => {
    render(<ActivePredictionsList predictions={mockPredictions} />)
    expect(screen.getByText('Active Predictions (3)')).toBeInTheDocument()
  })

  it('renders all prediction rows', () => {
    render(<ActivePredictionsList predictions={mockPredictions} />)
    expect(screen.getByText('institutional_inflow')).toBeInTheDocument()
    expect(screen.getByText('macro_positive')).toBeInTheDocument()
    expect(screen.getByText('whale_movement')).toBeInTheDocument()
  })

  it('sorts predictions by confidence descending', () => {
    render(<ActivePredictionsList predictions={mockPredictions} />)
    const rows = screen.getAllByRole('row')
    // First data row (index 1, after header) should be highest confidence
    const firstDataRow = rows[1]
    expect(firstDataRow.textContent).toContain('78%')
  })

  it('shows empty message when no predictions', () => {
    render(<ActivePredictionsList predictions={[]} />)
    expect(screen.getByText('No active predictions')).toBeInTheDocument()
  })

  it('renders direction badges', () => {
    render(<ActivePredictionsList predictions={mockPredictions} />)
    const longBadges = screen.getAllByText('LONG')
    expect(longBadges.length).toBe(2)
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })

  it('renders impact with sign', () => {
    render(<ActivePredictionsList predictions={mockPredictions} />)
    expect(screen.getByText('+2.3%')).toBeInTheDocument()
    expect(screen.getByText('-1.5%')).toBeInTheDocument()
  })
})
