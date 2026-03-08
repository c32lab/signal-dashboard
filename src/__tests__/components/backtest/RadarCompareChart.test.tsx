/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RadarCompareChart from '../../../components/backtest/RadarCompareChart'
import type { BacktestSummary } from '../../../types/backtest'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RadarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div />,
  PolarAngleAxis: () => <div />,
  PolarRadiusAxis: () => <div />,
  Legend: () => <div />,
  Tooltip: () => <div />,
}))

const makeSummary = (overrides: Partial<BacktestSummary> = {}): BacktestSummary => ({
  config: 'A_current',
  total_trades: 100,
  win_rate_pct: 55,
  total_pnl_pct: 12.5,
  sharpe: 1.8,
  max_drawdown_pct: 8.2,
  ...overrides,
})

describe('RadarCompareChart', () => {
  const summaries: BacktestSummary[] = [
    makeSummary({ config: 'A_current' }),
    makeSummary({ config: 'B_pre_freeze', win_rate_pct: 48, sharpe: 0.9, total_pnl_pct: -3.2, max_drawdown_pct: 15.1 }),
  ]

  it('renders heading', () => {
    render(<RadarCompareChart summary={summaries} />)
    expect(screen.getByText('Radar Comparison')).toBeInTheDocument()
  })

  it('renders a Radar element for each config', () => {
    render(<RadarCompareChart summary={summaries} />)
    const radars = screen.getAllByTestId('radar')
    expect(radars).toHaveLength(2)
  })

  it('returns null for empty summary', () => {
    const { container } = render(<RadarCompareChart summary={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('handles single config', () => {
    render(<RadarCompareChart summary={[summaries[0]]} />)
    const radars = screen.getAllByTestId('radar')
    expect(radars).toHaveLength(1)
  })
})
