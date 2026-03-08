/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ParamSweepHeatmap from '../../../components/backtest/ParamSweepHeatmap'
import type { BacktestSummary } from '../../../types/backtest'

const makeSummary = (overrides: Partial<BacktestSummary> = {}): BacktestSummary => ({
  config: 'A_current',
  total_trades: 100,
  win_rate_pct: 55,
  total_pnl_pct: 12.5,
  sharpe: 1.8,
  max_drawdown_pct: 8.2,
  ...overrides,
})

describe('ParamSweepHeatmap', () => {
  const summaries: BacktestSummary[] = [
    makeSummary({ config: 'A_current', win_rate_pct: 55, sharpe: 1.8, total_pnl_pct: 12.5, max_drawdown_pct: 8.2 }),
    makeSummary({ config: 'B_pre_freeze', win_rate_pct: 48, sharpe: 0.9, total_pnl_pct: -3.2, max_drawdown_pct: 15.1 }),
  ]

  it('renders heading', () => {
    render(<ParamSweepHeatmap summary={summaries} />)
    expect(screen.getByText('Parameter Sweep Heatmap')).toBeInTheDocument()
  })

  it('renders config names', () => {
    render(<ParamSweepHeatmap summary={summaries} />)
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('B_pre_freeze')).toBeInTheDocument()
  })

  it('renders metric column headers', () => {
    render(<ParamSweepHeatmap summary={summaries} />)
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('Sharpe')).toBeInTheDocument()
    expect(screen.getByText('PnL')).toBeInTheDocument()
    expect(screen.getByText('MaxDD')).toBeInTheDocument()
  })

  it('renders formatted metric values', () => {
    render(<ParamSweepHeatmap summary={summaries} />)
    expect(screen.getByText('55.0%')).toBeInTheDocument()
    expect(screen.getByText('1.80')).toBeInTheDocument()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
    expect(screen.getByText('8.2%')).toBeInTheDocument()
  })

  it('returns null for empty summary', () => {
    const { container } = render(<ParamSweepHeatmap summary={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('handles single config without error', () => {
    render(<ParamSweepHeatmap summary={[summaries[0]]} />)
    expect(screen.getByText('A_current')).toBeInTheDocument()
  })
})
