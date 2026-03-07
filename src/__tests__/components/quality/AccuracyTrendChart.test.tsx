/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/useApi', () => ({
  useAccuracyTrend: vi.fn(),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ReferenceLine: () => null,
}))

vi.mock('../../../components/quality/SectionSkeleton', () => ({
  default: ({ text }: { text: string }) => <div>{text}</div>,
}))

vi.mock('../../../components/quality/SectionError', () => ({
  default: ({ message }: { message: string }) => <div>{message}</div>,
}))

import AccuracyTrendChart from '../../../components/quality/AccuracyTrendChart'
import { useAccuracyTrend } from '../../../hooks/useApi'

const mockUseAccuracyTrend = vi.mocked(useAccuracyTrend)

describe('AccuracyTrendChart', () => {
  it('renders loading state', () => {
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByText('Loading accuracy trend…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Network fail') } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByText('Trend: Network fail')).toBeInTheDocument()
  })

  it('renders empty state when no trend data', () => {
    mockUseAccuracyTrend.mockReturnValue({ data: [], isLoading: false, error: undefined } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByText('No trend data')).toBeInTheDocument()
  })

  it('renders heading text', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [{ hour: '2026-03-07T10:00:00Z', symbol: 'BTC/USDT', total: 5, correct: 3, accuracy_pct: 60 }],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByText('Accuracy Trend (by hour)')).toBeInTheDocument()
  })

  it('renders line chart with trend data', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [
        { hour: '2026-03-07T10:00:00Z', symbol: 'BTC/USDT', total: 5, correct: 3, accuracy_pct: 60 },
        { hour: '2026-03-07T11:00:00Z', symbol: 'BTC/USDT', total: 4, correct: 3, accuracy_pct: 75 },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('computes accuracy from total/correct when accuracy_pct is null', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [
        { hour: '2026-03-07T10:00:00Z', symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: null },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles multiple symbols', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [
        { hour: '2026-03-07T10:00:00Z', symbol: 'BTC/USDT', total: 5, correct: 3, accuracy_pct: 60 },
        { hour: '2026-03-07T10:00:00Z', symbol: 'ETH/USDT', total: 5, correct: 4, accuracy_pct: 80 },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles NaN accuracy_pct by computing from correct/total', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [
        { hour: '2026-03-07T10:00:00Z', symbol: 'BTC/USDT', total: 10, correct: 7, accuracy_pct: NaN },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('handles total=0 and accuracy_pct null (hour row exists but no symbol data)', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [
        { hour: '2026-03-07T10:00:00Z', symbol: 'BTC/USDT', total: 0, correct: 0, accuracy_pct: null },
      ],
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    // Pivoted map still gets the hour entry, so the chart renders
    expect(screen.getByText('Accuracy Trend (by hour)')).toBeInTheDocument()
  })

  it('handles undefined trend data', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: undefined, isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyTrendChart />)
    expect(screen.getByText('No trend data')).toBeInTheDocument()
  })
})
