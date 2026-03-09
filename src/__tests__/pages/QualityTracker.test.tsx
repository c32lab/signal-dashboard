/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

type HookResult = { data: unknown; isLoading: boolean; error: Error | undefined }
const mockUsePerformance = vi.fn((): HookResult => ({ data: undefined, isLoading: true, error: undefined }))
const mockUseAccuracyTrend = vi.fn((): HookResult => ({ data: undefined, isLoading: true, error: undefined }))
const mockUseSignalQuality = vi.fn((): HookResult => ({ data: undefined, isLoading: true, error: undefined }))
const mockUseAccuracy = vi.fn((): HookResult => ({ data: undefined, isLoading: true, error: undefined }))
const mockUseConfidence = vi.fn((): HookResult => ({ data: undefined, isLoading: false, error: undefined }))
const mockUseCombinerWeights = vi.fn((): HookResult => ({ data: undefined, isLoading: false, error: undefined }))
const mockUseAccuracyTrendWeekly = vi.fn((): HookResult => ({ data: [], isLoading: false, error: undefined }))

vi.mock('../../hooks/useApi', () => ({
  usePerformance: () => mockUsePerformance(),
  useAccuracyTrend: () => mockUseAccuracyTrend(),
  useSignalQuality: () => mockUseSignalQuality(),
  useAccuracy: () => mockUseAccuracy(),
  useConfidence: () => mockUseConfidence(),
  useCombinerWeights: () => mockUseCombinerWeights(),
  useAccuracyTrendWeekly: () => mockUseAccuracyTrendWeekly(),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  Cell: () => <div />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  ReferenceLine: () => <div />,
}))

import QualityTracker from '../../pages/QualityTracker'

describe('QualityTracker', () => {
  beforeEach(() => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: true, error: undefined })
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: true, error: undefined })
    mockUseSignalQuality.mockReturnValue({ data: undefined, isLoading: true, error: undefined })
    mockUseAccuracy.mockReturnValue({ data: undefined, isLoading: true, error: undefined })
    mockUseConfidence.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseCombinerWeights.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
  })

  it('renders without crashing', () => {
    const { container } = render(<QualityTracker />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows loading skeletons for performance', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading overall performance…')).toBeInTheDocument()
  })

  it('shows loading skeletons for accuracy', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading accuracy overview…')).toBeInTheDocument()
  })

  it('shows loading for leaderboard', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading leaderboard…')).toBeInTheDocument()
  })

  it('shows loading for trend', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading trend…')).toBeInTheDocument()
  })

  it('shows error for performance', () => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: new Error('perf fail') })
    render(<QualityTracker />)
    expect(screen.getByText('Performance: perf fail')).toBeInTheDocument()
  })

  it('shows error for accuracy', () => {
    mockUseAccuracy.mockReturnValue({ data: undefined, isLoading: false, error: new Error('acc fail') })
    render(<QualityTracker />)
    expect(screen.getByText('Accuracy: acc fail')).toBeInTheDocument()
  })

  it('shows error for trend', () => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: false, error: new Error('trend fail') })
    render(<QualityTracker />)
    const els = screen.getAllByText('Trend: trend fail')
    expect(els.length).toBeGreaterThanOrEqual(1)
  })

  it('shows error for quality', () => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseSignalQuality.mockReturnValue({ data: undefined, isLoading: false, error: new Error('quality fail') })
    render(<QualityTracker />)
    expect(screen.getByText('Quality: quality fail')).toBeInTheDocument()
  })

  it('shows "No overall data" when perfOverall is undefined', () => {
    mockUsePerformance.mockReturnValue({ data: { by_symbol: [] }, isLoading: false, error: undefined })
    render(<QualityTracker />)
    expect(screen.getByText('No overall data')).toBeInTheDocument()
  })

  it('shows "No accuracy data" when accuracyData is undefined', () => {
    mockUseAccuracy.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    render(<QualityTracker />)
    expect(screen.getByText('No accuracy data')).toBeInTheDocument()
  })

  it('shows "No performance data" when perfData is empty', () => {
    mockUsePerformance.mockReturnValue({
      data: { overall: { total: 0 }, by_symbol: [] },
      isLoading: false, error: undefined,
    })
    render(<QualityTracker />)
    expect(screen.getByText('No performance data')).toBeInTheDocument()
  })

  it('renders data when all hooks return data', () => {
    mockUsePerformance.mockReturnValue({
      data: { overall: { total: 100, correct: 60, accuracy_pct: 60, avg_pnl_pct: 0.5 }, by_symbol: [{ symbol: 'BTC', total: 50, correct: 30, accuracy_pct: 60, avg_pnl_pct: 0.5 }] },
      isLoading: false, error: undefined,
    })
    mockUseAccuracy.mockReturnValue({ data: { overall_accuracy: 60 }, isLoading: false, error: undefined })
    mockUseAccuracyTrend.mockReturnValue({
      data: [{ hour: '2026-03-07T01:00:00Z', symbol: 'BTC/USDT', total: 10, correct: 6, accuracy_pct: 60 }],
      isLoading: false, error: undefined,
    })
    mockUseSignalQuality.mockReturnValue({
      data: { by_symbol: { 'BTC/USDT': { long: 5, short: 3, hold: 2 } } },
      isLoading: false, error: undefined,
    })
    mockUseConfidence.mockReturnValue({
      data: { confidence_buckets: [{ bucket: 'high_50+', action: 'LONG', decision_type: 'FAST', cnt: 5, avg_conf: 0.6, avg_score: 0.5 }] },
      isLoading: false, error: undefined,
    })
    render(<QualityTracker />)
    expect(screen.queryByText('Loading overall performance…')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading accuracy overview…')).not.toBeInTheDocument()
  })

  it('shows loading for signal quality', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading signal quality…')).toBeInTheDocument()
  })

  it('renders confidence distribution when confidenceRes has data', () => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseSignalQuality.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracy.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseConfidence.mockReturnValue({
      data: { confidence_buckets: [{ bucket: 'high_50+', action: 'LONG', decision_type: 'FAST', cnt: 5, avg_conf: 0.6, avg_score: 0.5 }] },
      isLoading: false, error: undefined,
    })
    const { container } = render(<QualityTracker />)
    expect(container.firstChild).toBeTruthy()
  })

  it('does not render confidence distribution when confidenceRes.data is undefined', () => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseSignalQuality.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracy.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseConfidence.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    const { container } = render(<QualityTracker />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders leaderboard when perfData has entries', () => {
    mockUsePerformance.mockReturnValue({
      data: {
        overall: { total: 100, correct: 60, accuracy_pct: 60, avg_pnl_pct: 0.5 },
        by_symbol: [{ symbol: 'BTC', total: 50, correct: 30, accuracy_pct: 60, avg_pnl_pct: 0.5 }],
      },
      isLoading: false, error: undefined,
    })
    render(<QualityTracker />)
    expect(screen.queryByText('No performance data')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading leaderboard…')).not.toBeInTheDocument()
  })

  it('shows leaderboard error when perfRes has error', () => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: new Error('leaderboard fail') })
    render(<QualityTracker />)
    expect(screen.getByText('Leaderboard: leaderboard fail')).toBeInTheDocument()
  })

  it('renders quality table when qualityRes has data', () => {
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracyTrend.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseSignalQuality.mockReturnValue({
      data: { by_symbol: { 'BTC/USDT': { long: 5, short: 3, hold: 2 } } },
      isLoading: false, error: undefined,
    })
    const { container } = render(<QualityTracker />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders overall summary when perfOverall exists', () => {
    mockUsePerformance.mockReturnValue({
      data: {
        overall: { total: 100, correct: 60, accuracy_pct: 60, avg_pnl_pct: 0.5 },
        by_symbol: [],
      },
      isLoading: false, error: undefined,
    })
    render(<QualityTracker />)
    expect(screen.queryByText('No overall data')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading overall performance…')).not.toBeInTheDocument()
  })

  it('renders accuracy overview when accuracyData exists', () => {
    mockUseAccuracy.mockReturnValue({
      data: { timestamp: 't', windows: { '6h': { total_actionable: 10, accuracy: { '1h_pct': 50, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] }, '12h': { total_actionable: 10, accuracy: { '1h_pct': 50, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] }, '24h': { total_actionable: 10, accuracy: { '1h_pct': 50, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] } } },
      isLoading: false, error: undefined,
    })
    render(<QualityTracker />)
    expect(screen.queryByText('No accuracy data')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading accuracy overview…')).not.toBeInTheDocument()
  })
})
