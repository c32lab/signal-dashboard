/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AccuracyAutoReport from '../../../components/quality/AccuracyAutoReport'
import type { AccuracyResponse } from '../../../types'

const mockData: AccuracyResponse = {
  timestamp: '2026-03-08T12:00:00Z',
  windows: {
    '6h': {
      total_actionable: 8,
      accuracy: { '1h_pct': 40.0, '4h_pct': 55.0 },
      by_symbol: {
        'BTC/USDT': { total: 5, accuracy_1h_pct: 50.0, accuracy_4h_pct: 60.0 },
        'ETH/USDT': { total: 3, accuracy_1h_pct: 33.3, accuracy_4h_pct: 50.0 },
      },
      dampened_symbols: [],
    },
    '12h': {
      total_actionable: 15,
      accuracy: { '1h_pct': 48.0, '4h_pct': 58.0 },
      by_symbol: {
        'BTC/USDT': { total: 10, accuracy_1h_pct: 50.0, accuracy_4h_pct: 60.0 },
        'ETH/USDT': { total: 5, accuracy_1h_pct: 40.0, accuracy_4h_pct: 55.0 },
      },
      dampened_symbols: [],
    },
    '24h': {
      total_actionable: 30,
      accuracy: { '1h_pct': 52.0, '4h_pct': 62.0 },
      by_symbol: {
        'BTC/USDT': { total: 15, accuracy_1h_pct: 55.0, accuracy_4h_pct: 65.0 },
        'ETH/USDT': { total: 10, accuracy_1h_pct: 50.0, accuracy_4h_pct: 60.0 },
        'SOL/USDT': { total: 5, accuracy_1h_pct: 40.0, accuracy_4h_pct: 50.0 },
      },
      dampened_symbols: [],
    },
  },
}

vi.mock('../../../hooks/useApi', () => ({
  useAccuracy: () => ({ data: mockData, isLoading: false, error: undefined }),
}))

describe('AccuracyAutoReport', () => {
  it('renders heading and defaults to 24h window', () => {
    render(<AccuracyAutoReport />)
    expect(screen.getByText('Accuracy Auto Report')).toBeInTheDocument()
    expect(screen.getByText('62.0%')).toBeInTheDocument()
    expect(screen.getByText('52.0%')).toBeInTheDocument()
  })

  it('shows actionable count for default window', () => {
    render(<AccuracyAutoReport />)
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('shows top symbols sorted by trade count', () => {
    render(<AccuracyAutoReport />)
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
    expect(screen.getByText('SOL/USDT')).toBeInTheDocument()
  })

  it('switches to 6h window on click', () => {
    render(<AccuracyAutoReport />)
    fireEvent.click(screen.getByText('6h'))
    expect(screen.getByText('55.0%')).toBeInTheDocument()
    expect(screen.getByText('40.0%')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows last updated timestamp', () => {
    render(<AccuracyAutoReport />)
    expect(screen.getByTestId('last-updated')).toHaveTextContent('Last updated:')
  })
})
