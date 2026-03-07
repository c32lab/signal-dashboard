/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { BacktestResponse, BacktestResult } from '../../types/backtest'

// Mock hooks
vi.mock('../../hooks/useApi', () => ({
  useBacktest: vi.fn(),
}))

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

// Mock backtest sub-components
vi.mock('../../components/backtest', () => ({
  ConfigWeightsDetail: () => <div data-testid="config-weights" />,
  ParamCompareTable: () => <div data-testid="param-compare" />,
  RegimeFilter: () => <div data-testid="regime-filter" />,
  RegimeMiniCard: () => <div data-testid="regime-card" />,
  SummaryCard: ({ config }: { config: string }) => <div data-testid="summary-card">{config}</div>,
  CONFIG_COLORS: {} as Record<string, string>,
  PnlCompareChart: () => <div data-testid="pnl-chart" />,
  WinRateCompareChart: () => <div data-testid="winrate-chart" />,
}))

vi.mock('../../components/SectionErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import BacktestDashboard from '../../pages/BacktestDashboard'
import { useBacktest } from '../../hooks/useApi'

const mockUseBacktest = vi.mocked(useBacktest)

function makeResult(overrides?: Partial<BacktestResult>): BacktestResult {
  return {
    generated_at: '2026-01-15T12:00:00Z',
    data_range: { start: '2026-01-01', end: '2026-01-15' },
    configs: {
      A: { weights: { x: 1 }, description: 'Config A' },
      B: { weights: { x: 2 }, description: 'Config B' },
    },
    summary: [
      { config: 'A', total_trades: 50, win_rate_pct: 60, total_pnl_pct: 5.2, sharpe: 1.1, max_drawdown_pct: 3.0 },
      { config: 'B', total_trades: 45, win_rate_pct: 55, total_pnl_pct: 3.1, sharpe: 0.9, max_drawdown_pct: 4.5 },
    ],
    by_symbol: {
      BTCUSDT: [
        { config: 'A', trades: 20, win_rate_pct: 65, total_pnl_pct: 3.0, sharpe: 1.2 },
      ],
    },
    pnl_curve: {
      A: [{ timestamp: '2026-01-05T00:00:00Z', cumulative_pnl_pct: 2.0 }],
    },
    ...overrides,
  }
}

function makeResponse(results: BacktestResult[]): BacktestResponse {
  return { results }
}

describe('BacktestDashboard', () => {
  it('renders loading skeleton', () => {
    mockUseBacktest.mockReturnValue({
      data: undefined, isLoading: true, error: undefined,
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    const pulses = document.querySelectorAll('.animate-pulse')
    expect(pulses.length).toBeGreaterThan(0)
  })

  it('renders error message', () => {
    mockUseBacktest.mockReturnValue({
      data: undefined, isLoading: false, error: new Error('API down'),
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByText(/Failed to load backtest data/)).toBeInTheDocument()
    expect(screen.getByText(/API down/)).toBeInTheDocument()
  })

  it('renders empty state when no results', () => {
    mockUseBacktest.mockReturnValue({
      data: makeResponse([]), isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByText('No backtest data available.')).toBeInTheDocument()
  })

  it('renders ResultView with summary cards when data present', () => {
    mockUseBacktest.mockReturnValue({
      data: makeResponse([makeResult()]), isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByText('Backtest A/B Test')).toBeInTheDocument()
    const cards = screen.getAllByTestId('summary-card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('A')
    expect(cards[1]).toHaveTextContent('B')
  })

  it('renders tabs when multiple results', () => {
    mockUseBacktest.mockReturnValue({
      data: makeResponse([makeResult(), makeResult({
        generated_at: '2026-02-01T00:00:00Z',
        data_range: { start: '2026-01-16', end: '2026-02-01' },
      })]),
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    // Should render tab buttons (one per result)
    const buttons = document.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })
})
