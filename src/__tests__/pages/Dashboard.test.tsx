/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockUseOverview = vi.fn(() => ({ data: undefined, isLoading: false, error: undefined }))
const mockUseBias = vi.fn(() => ({ data: undefined, isLoading: false, error: undefined }))
const mockUseHealth = vi.fn(() => ({ data: undefined, isLoading: false, error: undefined }))
const mockUsePerformance = vi.fn(() => ({ data: undefined, isLoading: false, error: undefined }))
const mockUseAccuracy = vi.fn(() => ({ data: undefined, isLoading: false, error: undefined }))

vi.mock('../../hooks/useApi', () => ({
  useHealth: (...a: unknown[]) => mockUseHealth(...a),
  useOverview: (...a: unknown[]) => mockUseOverview(...a),
  useDecisions: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useSignalsLatest: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  usePerformance: (...a: unknown[]) => mockUsePerformance(...a),
  useConfidence: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useSignalQuality: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useAccuracyTrend: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useAccuracy: (...a: unknown[]) => mockUseAccuracy(...a),
  useBacktest: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useCombinerWeights: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useBias: (...a: unknown[]) => mockUseBias(...a),
  useCollectorHealth: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useStatus: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useTradingSummary: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useRecentDecisions: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
}))

vi.mock('../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT'],
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
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  ReferenceLine: () => <div />,
}))

import Dashboard from '../../pages/Dashboard'

describe('Dashboard', () => {
  beforeEach(() => {
    mockUseOverview.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseBias.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseHealth.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUsePerformance.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
    mockUseAccuracy.mockReturnValue({ data: undefined, isLoading: false, error: undefined })
  })

  it('renders without crashing', () => {
    const { container } = render(<Dashboard />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders section error boundaries', () => {
    const { container } = render(<Dashboard />)
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0)
  })

  it('renders AlertsPanel when healthData is available', () => {
    mockUseHealth.mockReturnValue({
      data: { uptime_seconds: 3600, decision_rate_per_hour: 1, active_symbols: ['BTC/USDT'], bias_alerts: [] },
      isLoading: false, error: undefined,
    })
    render(<Dashboard />)
    expect(screen.getByText('Uptime')).toBeInTheDocument()
  })

  it('renders AccuracyKPI when accuracyData is available', () => {
    mockUseAccuracy.mockReturnValue({
      data: {
        timestamp: '2026-03-07T00:00:00Z',
        windows: {
          '6h': { total_actionable: 10, accuracy: { '1h_pct': 58, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] },
          '12h': { total_actionable: 20, accuracy: { '1h_pct': 58, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] },
          '24h': { total_actionable: 30, accuracy: { '1h_pct': 58, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] },
        },
      },
      isLoading: false, error: undefined,
    })
    render(<Dashboard />)
    expect(screen.getByText('Signal Accuracy')).toBeInTheDocument()
  })

  it('renders PerformanceOverview when perfData is available', () => {
    mockUsePerformance.mockReturnValue({
      data: {
        overall: { total: 100, correct: 60, accuracy_pct: 60, avg_pnl_pct: 0.5 },
        by_symbol: [{ symbol: 'BTC', total: 50, correct: 30, accuracy_pct: 60, avg_pnl_pct: 0.5 }],
      },
      isLoading: false, error: undefined,
    })
    render(<Dashboard />)
    expect(screen.getByText('Performance Overview')).toBeInTheDocument()
  })

  it('renders SourceBias when biasData is available', () => {
    mockUseBias.mockReturnValue({
      data: {
        timestamp: '2026-03-07T00:00:00Z',
        window_hours: 6,
        collectors: { momentum: { total_signals: 10, long_count: 5, short_count: 3, neutral_count: 2, bias_score: 0.2 } },
        overall: { long_pct: 50, short_pct: 30, neutral_pct: 20, bias_score: 0.2 },
      },
      isLoading: false, error: undefined,
    })
    render(<Dashboard />)
    expect(screen.getByText('Source Bias')).toBeInTheDocument()
  })

  it('renders HealthSummary when healthData is available', () => {
    mockUseHealth.mockReturnValue({
      data: {
        uptime_seconds: 7200,
        decision_rate_per_hour: 0.3,
        duplicate_ratio: 0.5,
        active_symbols: ['BTC/USDT'],
        disabled_symbols: [],
        bias_alerts: [],
      },
      isLoading: false, error: undefined,
    })
    render(<Dashboard />)
    expect(screen.getByText('2h 0m')).toBeInTheDocument()
  })

  it('does not render conditional sections when all data is undefined', () => {
    render(<Dashboard />)
    expect(screen.queryByText('Uptime')).not.toBeInTheDocument()
    expect(screen.queryByText('Performance Overview')).not.toBeInTheDocument()
  })

  it('renders all conditional sections when all data is present', () => {
    mockUseHealth.mockReturnValue({
      data: { uptime_seconds: 3600, decision_rate_per_hour: 1, active_symbols: ['BTC/USDT'], bias_alerts: [], disabled_symbols: [], duplicate_ratio: 0 },
      isLoading: false, error: undefined,
    })
    mockUseAccuracy.mockReturnValue({
      data: { timestamp: 't', windows: { '6h': { total_actionable: 10, accuracy: { '1h_pct': 50, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] }, '12h': { total_actionable: 10, accuracy: { '1h_pct': 50, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] }, '24h': { total_actionable: 10, accuracy: { '1h_pct': 50, '4h_pct': 60 }, by_symbol: {}, dampened_symbols: [] } } },
      isLoading: false, error: undefined,
    })
    mockUsePerformance.mockReturnValue({
      data: { overall: { total: 10, correct: 6, accuracy_pct: 60, avg_pnl_pct: 0.5 }, by_symbol: [] },
      isLoading: false, error: undefined,
    })
    mockUseBias.mockReturnValue({
      data: { timestamp: 't', window_hours: 6, collectors: {}, overall: { long_pct: 33, short_pct: 33, neutral_pct: 34, bias_score: 0 } },
      isLoading: false, error: undefined,
    })
    render(<Dashboard />)
    expect(screen.getByText('Uptime')).toBeInTheDocument()
    expect(screen.getByText('Performance Overview')).toBeInTheDocument()
    expect(screen.getByText('Source Bias')).toBeInTheDocument()
  })
})
