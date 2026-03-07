/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useBacktest: vi.fn(),
}))

vi.mock('../../utils/format', () => ({
  formatDateTime: (v: string) => v,
  formatDate: (v: string) => v.slice(0, 10),
}))

vi.mock('../../components/backtest', () => ({
  BacktestResultView: ({ result }: { result: { generated_at: string } }) => (
    <div data-testid="backtest-result-view">Result: {result.generated_at}</div>
  ),
  BacktestSkeleton: () => <div data-testid="backtest-skeleton">Loading...</div>,
}))

import BacktestDashboard from '../../pages/BacktestDashboard'
import { useBacktest } from '../../hooks/useApi'

const mockUseBacktest = vi.mocked(useBacktest)

describe('BacktestDashboard', () => {
  it('renders skeleton while loading', () => {
    mockUseBacktest.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByTestId('backtest-skeleton')).toBeInTheDocument()
  })

  it('renders error message', () => {
    mockUseBacktest.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Failed') } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByText(/Failed to load backtest data/)).toBeInTheDocument()
    expect(screen.getByText(/Failed/)).toBeInTheDocument()
  })

  it('renders empty state when no results', () => {
    mockUseBacktest.mockReturnValue({
      data: { results: [] },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByText('No backtest data available.')).toBeInTheDocument()
  })

  it('renders BacktestResultView with data', () => {
    mockUseBacktest.mockReturnValue({
      data: {
        results: [{
          generated_at: '2026-03-01T00:00:00Z',
          data_range: { start: '2026-01-01', end: '2026-03-01' },
          configs: {},
          summary: [],
          by_symbol: {},
          pnl_curve: {},
        }],
      },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByTestId('backtest-result-view')).toBeInTheDocument()
  })

  it('renders tabs when multiple results exist', () => {
    mockUseBacktest.mockReturnValue({
      data: {
        results: [
          {
            generated_at: '2026-03-01T00:00:00Z',
            data_range: { start: '2026-01-01', end: '2026-02-01' },
            configs: {}, summary: [], by_symbol: {}, pnl_curve: {},
          },
          {
            generated_at: '2026-03-02T00:00:00Z',
            data_range: { start: '2026-02-01', end: '2026-03-01' },
            configs: {}, summary: [], by_symbol: {}, pnl_curve: {},
          },
        ],
      },
      isLoading: false, error: undefined,
    } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    const tabs = screen.getAllByRole('button')
    expect(tabs.length).toBe(2)
  })

  it('handles null data', () => {
    mockUseBacktest.mockReturnValue({ data: undefined, isLoading: false, error: undefined } as unknown as ReturnType<typeof useBacktest>)
    render(<BacktestDashboard />)
    expect(screen.getByText('No backtest data available.')).toBeInTheDocument()
  })
})
