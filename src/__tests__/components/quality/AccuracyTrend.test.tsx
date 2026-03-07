/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}))

import AccuracyTrend from '../../../components/quality/AccuracyTrend'
import type { AccuracyTrendItem } from '../../../types'

const sampleData: AccuracyTrendItem[] = [
  { hour: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: 60 },
  { hour: '2026-03-07T02:00:00Z', symbol: 'BTC/USDT', total: 8, correct: 5, accuracy_pct: 62.5 },
  { hour: '2026-03-07T01:00:00Z', symbol: 'ETH/USDT', total: 5, correct: 3, accuracy_pct: 60 },
]

describe('AccuracyTrend', () => {
  it('renders section title', () => {
    render(<AccuracyTrend data={sampleData} hours={24} onHoursChange={vi.fn()} />)
    expect(screen.getByText('Accuracy Trend')).toBeInTheDocument()
  })

  it('renders hour selector buttons', () => {
    render(<AccuracyTrend data={sampleData} hours={24} onHoursChange={vi.fn()} />)
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('12h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('highlights active hour button', () => {
    render(<AccuracyTrend data={sampleData} hours={12} onHoursChange={vi.fn()} />)
    const btn12 = screen.getByText('12h')
    expect(btn12.className).toContain('bg-blue-600')
  })

  it('calls onHoursChange when button is clicked', () => {
    const onHoursChange = vi.fn()
    render(<AccuracyTrend data={sampleData} hours={24} onHoursChange={onHoursChange} />)
    fireEvent.click(screen.getByText('6h'))
    expect(onHoursChange).toHaveBeenCalledWith(6)
  })

  it('renders chart when data is available', () => {
    render(<AccuracyTrend data={sampleData} hours={24} onHoursChange={vi.fn()} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders empty state when no data', () => {
    render(<AccuracyTrend data={[]} hours={24} onHoursChange={vi.fn()} />)
    expect(screen.getByText('No trend data')).toBeInTheDocument()
  })

  it('computes accuracy from total/correct when accuracy_pct is null', () => {
    const data: AccuracyTrendItem[] = [
      { hour: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: null as unknown as number },
    ]
    render(<AccuracyTrend data={data} hours={24} onHoursChange={vi.fn()} />)
    // Should still render a chart (computed 60% accuracy)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('handles NaN accuracy_pct by computing from total/correct', () => {
    const data: AccuracyTrendItem[] = [
      { hour: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: NaN },
    ]
    render(<AccuracyTrend data={data} hours={24} onHoursChange={vi.fn()} />)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('handles entry when total is 0 and accuracy_pct is null', () => {
    const data: AccuracyTrendItem[] = [
      { hour: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', total: 0, correct: 0, accuracy_pct: null as unknown as number },
    ]
    render(<AccuracyTrend data={data} hours={24} onHoursChange={vi.fn()} />)
    // Pivoted map still gets an hour entry (no symbol data), chart renders
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('applies inactive style to non-selected hour buttons', () => {
    render(<AccuracyTrend data={sampleData} hours={24} onHoursChange={vi.fn()} />)
    const btn6 = screen.getByText('6h')
    expect(btn6.className).toContain('bg-gray-800')
    expect(btn6.className).not.toContain('bg-blue-600')
  })

  it('handles unknown symbol not in SYMBOL_COLORS', () => {
    const data: AccuracyTrendItem[] = [
      { hour: '2026-03-07T01:00:00Z', symbol: 'DOGE/USDT', total: 10, correct: 5, accuracy_pct: 50 },
    ]
    render(<AccuracyTrend data={data} hours={24} onHoursChange={vi.fn()} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('calls onHoursChange with 12 when 12h clicked', () => {
    const handler = vi.fn()
    render(<AccuracyTrend data={sampleData} hours={24} onHoursChange={handler} />)
    fireEvent.click(screen.getByText('12h'))
    expect(handler).toHaveBeenCalledWith(12)
  })
})
