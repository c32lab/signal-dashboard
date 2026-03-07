/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock recharts to avoid rendering issues in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Cell: () => <div />,
}))

import { vi } from 'vitest'
import TradeStats from '../../../components/trading/TradeStats'

const defaultProps = {
  totalCount: 100,
  openCount: 30,
  closedCount: 70,
  winRate: 65.5,
  longCount: 60,
  shortCount: 40,
}

describe('TradeStats', () => {
  it('renders the heading', () => {
    render(<TradeStats {...defaultProps} />)
    expect(screen.getByText('交易统计')).toBeInTheDocument()
  })

  it('renders total count', () => {
    render(<TradeStats {...defaultProps} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('总交易数')).toBeInTheDocument()
  })

  it('renders open count', () => {
    render(<TradeStats {...defaultProps} />)
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('开仓中')).toBeInTheDocument()
  })

  it('renders closed count', () => {
    render(<TradeStats {...defaultProps} />)
    expect(screen.getByText('70')).toBeInTheDocument()
    expect(screen.getByText('已平仓')).toBeInTheDocument()
  })

  it('renders win rate', () => {
    render(<TradeStats {...defaultProps} />)
    expect(screen.getByText('65.5%')).toBeInTheDocument()
  })

  it('shows green color for win rate >= 50', () => {
    render(<TradeStats {...defaultProps} winRate={55} />)
    const el = screen.getByText('55.0%')
    expect(el.className).toContain('text-green-400')
  })

  it('shows red color for win rate < 50', () => {
    render(<TradeStats {...defaultProps} winRate={35} />)
    const el = screen.getByText('35.0%')
    expect(el.className).toContain('text-red-400')
  })

  it('shows small sample warning when closedCount < 10 and > 0', () => {
    render(<TradeStats {...defaultProps} closedCount={5} />)
    expect(screen.getByText(/样本少/)).toBeInTheDocument()
  })

  it('does not show small sample warning when closedCount >= 10', () => {
    render(<TradeStats {...defaultProps} closedCount={50} />)
    expect(screen.queryByText(/样本少/)).not.toBeInTheDocument()
  })

  it('does not show small sample warning when closedCount is 0', () => {
    render(<TradeStats {...defaultProps} closedCount={0} />)
    expect(screen.queryByText(/样本少/)).not.toBeInTheDocument()
  })

  it('renders LONG percentage', () => {
    render(<TradeStats {...defaultProps} />)
    expect(screen.getByText('60.0%')).toBeInTheDocument()
    expect(screen.getByText('LONG 占比')).toBeInTheDocument()
  })

  it('renders SHORT percentage', () => {
    render(<TradeStats {...defaultProps} />)
    expect(screen.getByText('40.0%')).toBeInTheDocument()
    expect(screen.getByText('SHORT 占比')).toBeInTheDocument()
  })

  it('handles zero totalCount without division error', () => {
    render(<TradeStats {...defaultProps} totalCount={0} longCount={0} shortCount={0} winRate={0} />)
    // LONG 占比 and SHORT 占比 both show 0.0%
    const zeroPercents = screen.getAllByText('0.0%')
    expect(zeroPercents.length).toBeGreaterThanOrEqual(2)
  })
})
