/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ForecastSignalCards from '../../../components/forecast/ForecastSignalCards'
import type { ForecastSignal } from '../../../types'

const mockSignals: ForecastSignal[] = [
  {
    symbol: 'BTC/USDT',
    direction: 'LONG',
    confidence: 0.78,
    prediction_count: 2,
    predictions: [
      { id: 1, symbol: 'BTC/USDT', direction: 'LONG', confidence: 0.78, trigger_pattern: 'institutional_inflow', trigger_event: 'Test', expected_impact: 2.3, expected_horizon: '1d', timestamp: '2026-03-10T08:30:00Z' },
    ],
  },
  {
    symbol: 'SOL/USDT',
    direction: 'SHORT',
    confidence: 0.62,
    prediction_count: 1,
    predictions: [
      { id: 2, symbol: 'SOL/USDT', direction: 'SHORT', confidence: 0.62, trigger_pattern: 'whale_movement', trigger_event: 'Test', expected_impact: -1.5, expected_horizon: '1d', timestamp: '2026-03-10T06:45:00Z' },
    ],
  },
]

describe('ForecastSignalCards', () => {
  it('renders a card for each signal', () => {
    render(<ForecastSignalCards signals={mockSignals} />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('SOL')).toBeInTheDocument()
  })

  it('renders direction badges', () => {
    render(<ForecastSignalCards signals={mockSignals} />)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })

  it('renders confidence as percentage (x100)', () => {
    render(<ForecastSignalCards signals={mockSignals} />)
    expect(screen.getByText('78%')).toBeInTheDocument()
    expect(screen.getByText('62%')).toBeInTheDocument()
  })

  it('renders expected impact', () => {
    render(<ForecastSignalCards signals={mockSignals} />)
    expect(screen.getByText('+2.3%')).toBeInTheDocument()
    expect(screen.getByText('-1.5%')).toBeInTheDocument()
  })

  it('renders prediction count', () => {
    render(<ForecastSignalCards signals={mockSignals} />)
    expect(screen.getByText('2 predictions')).toBeInTheDocument()
    expect(screen.getByText('1 prediction')).toBeInTheDocument()
  })

  it('applies green border for LONG direction', () => {
    const { container } = render(<ForecastSignalCards signals={[mockSignals[0]]} />)
    const card = container.querySelector('.border-green-800')
    expect(card).toBeInTheDocument()
  })

  it('applies red border for SHORT direction', () => {
    const { container } = render(<ForecastSignalCards signals={[mockSignals[1]]} />)
    const card = container.querySelector('.border-red-800')
    expect(card).toBeInTheDocument()
  })
})
