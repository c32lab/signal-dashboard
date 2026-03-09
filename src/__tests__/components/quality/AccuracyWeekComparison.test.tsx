/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AccuracyWeekComparison from '../../../components/quality/AccuracyWeekComparison'

const now = Date.now()
const oneDay = 24 * 3600 * 1000

const mockTrendData = [
  // This week (2 days ago)
  { hour: new Date(now - 2 * oneDay).toISOString(), symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: 60 },
  { hour: new Date(now - 2 * oneDay).toISOString(), symbol: 'ETH/USDT', total: 8, correct: 5, accuracy_pct: 62.5 },
  // Last week (10 days ago)
  { hour: new Date(now - 10 * oneDay).toISOString(), symbol: 'BTC/USDT', total: 12, correct: 5, accuracy_pct: 41.7 },
  { hour: new Date(now - 10 * oneDay).toISOString(), symbol: 'ETH/USDT', total: 6, correct: 3, accuracy_pct: 50 },
]

vi.mock('../../../hooks/useApi', () => ({
  useAccuracyTrendWeekly: () => ({ data: mockTrendData, isLoading: false, error: undefined }),
}))

describe('AccuracyWeekComparison', () => {
  it('renders heading', () => {
    render(<AccuracyWeekComparison />)
    expect(screen.getByText('Week-over-Week Comparison')).toBeInTheDocument()
  })

  it('shows This Week and Last Week labels', () => {
    render(<AccuracyWeekComparison />)
    expect(screen.getByText('This Week')).toBeInTheDocument()
    expect(screen.getByText('Last Week')).toBeInTheDocument()
  })

  it('computes this week stats correctly', () => {
    render(<AccuracyWeekComparison />)
    // This week: 18 trades, 11 correct, 61.1% win rate
    expect(screen.getByText('61.1%')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
  })

  it('computes last week stats correctly', () => {
    render(<AccuracyWeekComparison />)
    // Last week: 18 trades, 8 correct, 44.4% win rate
    expect(screen.getByText('44.4%')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows change indicators', () => {
    render(<AccuracyWeekComparison />)
    expect(screen.getByTestId('winrate-change')).toBeInTheDocument()
    expect(screen.getByTestId('trades-change')).toBeInTheDocument()
  })
})
