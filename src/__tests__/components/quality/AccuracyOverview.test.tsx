/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AccuracyOverview from '../../../components/quality/AccuracyOverview'
import type { AccuracyResponse } from '../../../types'

function makeData(overrides: Partial<Record<'6h' | '12h' | '24h', Partial<{ total_actionable: number; accuracy: { '1h_pct': number; '4h_pct': number }; dampened_symbols: string[] }>>> = {}): AccuracyResponse {
  const defaultWindow = { total_actionable: 10, accuracy: { '1h_pct': 55.5, '4h_pct': 62.3 }, by_symbol: {}, dampened_symbols: [] }
  return {
    timestamp: '2026-03-07T00:00:00Z',
    windows: {
      '6h': { ...defaultWindow, accuracy: { '1h_pct': 45.0, '4h_pct': 50.0 }, ...overrides['6h'] },
      '12h': { ...defaultWindow, accuracy: { '1h_pct': 52.0, '4h_pct': 58.0 }, ...overrides['12h'] },
      '24h': { ...defaultWindow, ...overrides['24h'] },
    },
  }
}

describe('AccuracyOverview', () => {
  it('renders heading and default 24h window', () => {
    render(<AccuracyOverview data={makeData()} />)
    expect(screen.getByText('Accuracy Overview')).toBeInTheDocument()
    expect(screen.getByText('55.5%')).toBeInTheDocument()
    expect(screen.getByText('62.3%')).toBeInTheDocument()
    expect(screen.getByText('Window: 24h')).toBeInTheDocument()
  })

  it('shows 1h and 4h accuracy labels', () => {
    render(<AccuracyOverview data={makeData()} />)
    expect(screen.getByText('1h Accuracy')).toBeInTheDocument()
    expect(screen.getByText('4h Accuracy')).toBeInTheDocument()
  })

  it('switches to 6h window on click', () => {
    render(<AccuracyOverview data={makeData()} />)
    fireEvent.click(screen.getByText('6h'))
    expect(screen.getByText('45.0%')).toBeInTheDocument()
    expect(screen.getByText('50.0%')).toBeInTheDocument()
    expect(screen.getByText('Window: 6h')).toBeInTheDocument()
  })

  it('shows actionable signals count', () => {
    render(<AccuracyOverview data={makeData()} />)
    expect(screen.getByText('Actionable signals: 10')).toBeInTheDocument()
  })

  it('shows dampened warning when dampened_symbols is non-empty', () => {
    render(<AccuracyOverview data={makeData({ '24h': { dampened_symbols: ['BTC/USDT', 'ETH/USDT'] } })} />)
    expect(screen.getByText(/Dampened:.*BTC\/USDT.*ETH\/USDT/)).toBeInTheDocument()
  })

  it('does not show dampened warning when dampened_symbols is empty', () => {
    render(<AccuracyOverview data={makeData()} />)
    expect(screen.queryByText(/Dampened/)).not.toBeInTheDocument()
  })
})
