/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div />,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
}))

import AccuracyLeaderboard from '../../../components/quality/AccuracyLeaderboard'
import type { PerformanceSymbol } from '../../../types'

const sampleData: PerformanceSymbol[] = [
  { symbol: 'BTC/USDT', total: 50, correct: 30, accuracy_pct: 60, avg_pnl_pct: 2.5 },
  { symbol: 'ETH/USDT', total: 30, correct: 12, accuracy_pct: 40, avg_pnl_pct: -1.0 },
  { symbol: 'SOL/USDT', total: 3, correct: 2, accuracy_pct: 66.7, avg_pnl_pct: 5.0 },
]

describe('AccuracyLeaderboard', () => {
  it('renders section title', () => {
    render(<AccuracyLeaderboard data={sampleData} />)
    expect(screen.getByText('Accuracy Leaderboard')).toBeInTheDocument()
  })

  it('renders chart container', () => {
    render(<AccuracyLeaderboard data={sampleData} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders table with symbol rows', () => {
    render(<AccuracyLeaderboard data={sampleData} />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('SOL')).toBeInTheDocument()
  })

  it('shows correct/total counts', () => {
    render(<AccuracyLeaderboard data={sampleData} />)
    expect(screen.getByText('30 / 50')).toBeInTheDocument()
  })

  it('sorts by accuracy descending', () => {
    render(<AccuracyLeaderboard data={sampleData} />)
    const rows = screen.getAllByRole('row')
    // Header + 3 data rows; first data row should be SOL (66.7%)
    expect(rows[1].textContent).toContain('SOL')
  })

  it('shows low sample indicator for small total', () => {
    render(<AccuracyLeaderboard data={sampleData} />)
    expect(screen.getByText('(n=3)')).toBeInTheDocument()
  })

  it('handles empty data', () => {
    render(<AccuracyLeaderboard data={[]} />)
    expect(screen.getByText('Accuracy Leaderboard')).toBeInTheDocument()
  })

  it('calculates accuracy from correct/total when accuracy_pct is NaN', () => {
    const data: PerformanceSymbol[] = [
      { symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: NaN, avg_pnl_pct: 1.0 },
    ]
    render(<AccuracyLeaderboard data={data} />)
    expect(screen.getByText('60.0%')).toBeInTheDocument()
  })
})
