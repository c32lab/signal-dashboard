/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AccuracyKPI } from '../../components/dashboard/AccuracyKPI'
import type { AccuracyResponse } from '../../types'

const mockData: AccuracyResponse = {
  timestamp: '2026-03-07T00:00:00Z',
  windows: {
    '6h': {
      accuracy: { '1h_pct': 52.3, '4h_pct': 58.1 },
      total_actionable: 15,
      by_symbol: {
        'BTC/USDT': { accuracy_4h_pct: 60, accuracy_1h_pct: 55, total: 8 },
        'ETH/USDT': { accuracy_4h_pct: 50, accuracy_1h_pct: 45, total: 7 },
      },
      dampened_symbols: [],
    },
    '12h': {
      accuracy: { '1h_pct': 48.0, '4h_pct': 44.0 },
      total_actionable: 30,
      by_symbol: {},
      dampened_symbols: [],
    },
    '24h': {
      accuracy: { '1h_pct': 51.0, '4h_pct': 55.0 },
      total_actionable: 60,
      by_symbol: {},
      dampened_symbols: [],
    },
  },
}

describe('AccuracyKPI', () => {
  it('renders all three time windows (6h, 12h, 24h)', () => {
    render(<AccuracyKPI data={mockData} />)
    expect(screen.getByText('6h window')).toBeInTheDocument()
    expect(screen.getByText('12h window')).toBeInTheDocument()
    expect(screen.getByText('24h window')).toBeInTheDocument()
  })

  it('renders 4h accuracy as primary metric with correct formatting', () => {
    render(<AccuracyKPI data={mockData} />)
    expect(screen.getByText('58.1%')).toBeInTheDocument()
    expect(screen.getByText('44.0%')).toBeInTheDocument()
    expect(screen.getByText('55.0%')).toBeInTheDocument()
  })

  it('renders 1h accuracy', () => {
    render(<AccuracyKPI data={mockData} />)
    expect(screen.getByText('52.3%')).toBeInTheDocument()
    expect(screen.getByText('48.0%')).toBeInTheDocument()
    expect(screen.getByText('51.0%')).toBeInTheDocument()
  })

  it('renders actionable count', () => {
    render(<AccuracyKPI data={mockData} />)
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
  })

  it('applies green color for accuracy >= 55%', () => {
    render(<AccuracyKPI data={mockData} />)
    // 58.1% (6h 4h) should be green
    const el = screen.getByText('58.1%')
    expect(el.className).toContain('text-green-400')
  })

  it('applies yellow color for accuracy >= 45% and < 55%', () => {
    render(<AccuracyKPI data={mockData} />)
    // 52.3% (6h 1h) should be yellow
    const el = screen.getByText('52.3%')
    expect(el.className).toContain('text-yellow-400')
  })

  it('applies red color for accuracy < 45%', () => {
    render(<AccuracyKPI data={mockData} />)
    // 44.0% (12h 4h) should be red
    const el = screen.getByText('44.0%')
    expect(el.className).toContain('text-red-400')
  })

  it('"By symbol" toggle expands and collapses symbol breakdown', () => {
    render(<AccuracyKPI data={mockData} />)
    // Only 6h window has by_symbol data
    const toggle = screen.getByText('By symbol')
    expect(screen.queryByText('BTC')).not.toBeInTheDocument()

    fireEvent.click(toggle)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()

    fireEvent.click(toggle)
    expect(screen.queryByText('BTC')).not.toBeInTheDocument()
  })

  it('symbol breakdown shows correct columns (Symbol, 4h, 1h, N)', () => {
    render(<AccuracyKPI data={mockData} />)
    fireEvent.click(screen.getByText('By symbol'))

    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('4h')).toBeInTheDocument()
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument()
  })
})
