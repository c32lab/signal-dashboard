/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignalBreakdownTable from '../../../components/history/SignalBreakdownTable'
import type { RawSignal } from '../../../types'

describe('SignalBreakdownTable', () => {
  it('renders "No signal breakdown available" when signals is empty', () => {
    render(<SignalBreakdownTable signals={[]} />)
    expect(screen.getByText('No signal breakdown available')).toBeInTheDocument()
  })

  it('renders signal breakdown header', () => {
    const signals: RawSignal[] = [
      { source: 'RSI', direction: 'LONG', strength: 0.75, confidence: 0.8, timeframe: '1h', reasoning: 'Oversold' },
    ]
    render(<SignalBreakdownTable signals={signals} />)
    expect(screen.getByText('Signal Breakdown')).toBeInTheDocument()
  })

  it('renders signal source and direction', () => {
    const signals: RawSignal[] = [
      { source: 'MACD', direction: 'SHORT', strength: -0.5, confidence: 0.6, timeframe: '4h', reasoning: 'Bearish crossover' },
    ]
    render(<SignalBreakdownTable signals={signals} />)
    expect(screen.getByText('MACD')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('-0.50')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('renders table column headers', () => {
    const signals: RawSignal[] = [
      { source: 'RSI', direction: 'LONG', strength: 0.5, confidence: 0.5, timeframe: '1h', reasoning: 'test' },
    ]
    render(<SignalBreakdownTable signals={signals} />)
    expect(screen.getByText('Source')).toBeInTheDocument()
    expect(screen.getByText('Dir')).toBeInTheDocument()
    expect(screen.getByText('Conf')).toBeInTheDocument()
  })

  it('handles missing direction with dash', () => {
    const signals: RawSignal[] = [
      { source: 'RSI', direction: '', strength: 0, confidence: 0, timeframe: '', reasoning: '' },
    ]
    render(<SignalBreakdownTable signals={signals} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })
})
