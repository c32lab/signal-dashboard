/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryCard from '../../../components/backtest/SummaryCard'

const baseProps = {
  config: 'A_current',
  description: 'Current production weights',
  win_rate_pct: 55,
  total_pnl_pct: 12.5,
  sharpe: 1.23,
  max_drawdown_pct: 8.4,
  total_trades: 42,
  isBest: false,
}

describe('SummaryCard', () => {
  it('renders config name and description', () => {
    render(<SummaryCard {...baseProps} />)
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('Current production weights')).toBeInTheDocument()
  })

  it('shows star icon when isBest is true', () => {
    render(<SummaryCard {...baseProps} isBest={true} />)
    expect(screen.getByTitle('Best PnL')).toBeInTheDocument()
    expect(screen.getByText('⭐')).toBeInTheDocument()
  })

  it('does not show star icon when isBest is false', () => {
    render(<SummaryCard {...baseProps} isBest={false} />)
    expect(screen.queryByTitle('Best PnL')).not.toBeInTheDocument()
  })

  it('shows green for win rate >= 50 and red for win rate < 50', () => {
    const { rerender } = render(<SummaryCard {...baseProps} win_rate_pct={60} />)
    const winRateEl = screen.getByText('60.0%')
    expect(winRateEl.className).toContain('text-green-400')

    rerender(<SummaryCard {...baseProps} win_rate_pct={30} />)
    const redEl = screen.getByText('30.0%')
    expect(redEl.className).toContain('text-red-400')
  })

  it('shows green for PnL >= 0 and red for PnL < 0', () => {
    const { rerender } = render(<SummaryCard {...baseProps} total_pnl_pct={5.5} />)
    const pnlEl = screen.getByText('5.5%')
    expect(pnlEl.className).toContain('text-green-400')

    rerender(<SummaryCard {...baseProps} total_pnl_pct={-3.2} />)
    const redEl = screen.getByText('-3.2%')
    expect(redEl.className).toContain('text-red-400')
  })

  it('displays Sharpe and Max DD correctly', () => {
    render(<SummaryCard {...baseProps} sharpe={1.23} max_drawdown_pct={8.4} />)
    expect(screen.getByText('1.23')).toBeInTheDocument()
    expect(screen.getByText('8.4%')).toBeInTheDocument()
  })

  it('displays "0.00" when sharpe is null/undefined', () => {
    render(<SummaryCard {...baseProps} sharpe={undefined as unknown as number} />)
    expect(screen.getByText('0.00')).toBeInTheDocument()
  })

  it('uses fallback color for unknown config name', () => {
    const { container } = render(<SummaryCard {...baseProps} config="unknown_config_xyz" />)
    const dot = container.querySelector('[style*="background-color"]') as HTMLElement
    expect(dot?.style.backgroundColor).toBe('rgb(156, 163, 175)')
  })

  it('handles null pnl as 0', () => {
    render(<SummaryCard {...baseProps} total_pnl_pct={0} />)
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('handles null max_drawdown_pct as 0', () => {
    render(<SummaryCard {...baseProps} max_drawdown_pct={undefined as unknown as number} />)
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })
})
