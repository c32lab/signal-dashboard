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
  ReferenceLine: () => null,
}))

vi.mock('../../../components/quality/SectionSkeleton', () => ({
  default: ({ text }: { text: string }) => <div data-testid="section-skeleton">{text}</div>,
}))

vi.mock('../../../components/quality/SectionError', () => ({
  default: ({ message }: { message: string }) => <div data-testid="section-error">{message}</div>,
}))

import { AccuracyMiniTrend } from '../../../components/dashboard/AccuracyMiniTrend'
import { useAccuracyTrend } from '../../../hooks/useApi'

const mockUseAccuracyTrend = vi.mocked(useAccuracyTrend)

describe('AccuracyMiniTrend', () => {
  it('renders loading skeleton', () => {
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyMiniTrend />)
    expect(screen.getByTestId('section-skeleton')).toBeInTheDocument()
    expect(screen.getByText('Loading accuracy trend…')).toBeInTheDocument()
  })

  it('renders error message', () => {
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Network error') } as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyMiniTrend />)
    expect(screen.getByTestId('section-error')).toBeInTheDocument()
    expect(screen.getByText('Trend: Network error')).toBeInTheDocument()
  })

  it('renders "No trend data" when data is empty array', () => {
    mockUseAccuracyTrend.mockReturnValue({ data: [], isLoading: false, error: undefined } as unknown as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyMiniTrend />)
    expect(screen.getByText('No trend data')).toBeInTheDocument()
  })

  it('renders chart with trend data', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [
        { hour: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: 60 },
        { hour: '2026-03-07T02:00:00Z', symbol: 'BTC/USDT', total: 8, correct: 5, accuracy_pct: 62.5 },
      ],
      isLoading: false, error: undefined,
    } as unknown as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyMiniTrend />)
    expect(screen.getByText('Accuracy Trend (24h)')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders heading even with data', () => {
    mockUseAccuracyTrend.mockReturnValue({
      data: [
        { hour: '2026-03-07T01:00:00Z', symbol: 'ETH/USDT', total: 5, correct: 3, accuracy_pct: 60 },
      ],
      isLoading: false, error: undefined,
    } as unknown as unknown as ReturnType<typeof useAccuracyTrend>)
    render(<AccuracyMiniTrend />)
    expect(screen.getByText('Accuracy Trend (24h)')).toBeInTheDocument()
  })
})
