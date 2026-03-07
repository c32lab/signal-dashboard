/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KpiCardGrid from '../../../components/history/KpiCardGrid'

describe('KpiCardGrid', () => {
  it('renders dash values when overall is undefined', () => {
    render(<KpiCardGrid overall={undefined} activeSignals={null} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(3)
  })

  it('renders overall stats when provided', () => {
    render(
      <KpiCardGrid
        overall={{ total: 150, accuracy_pct: 55.5, avg_pnl_pct: 2.3 }}
        activeSignals={5}
      />
    )
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('55.5%')).toBeInTheDocument()
    expect(screen.getByText('+2.30%')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders labels', () => {
    render(<KpiCardGrid overall={undefined} activeSignals={null} />)
    expect(screen.getByText('Total Trades')).toBeInTheDocument()
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg PnL')).toBeInTheDocument()
    expect(screen.getByText('Active Signals')).toBeInTheDocument()
  })

  it('renders dash for null activeSignals', () => {
    render(
      <KpiCardGrid
        overall={{ total: 10, accuracy_pct: 50, avg_pnl_pct: 0 }}
        activeSignals={null}
      />
    )
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders zero active signals', () => {
    render(
      <KpiCardGrid
        overall={{ total: 10, accuracy_pct: 50, avg_pnl_pct: 0 }}
        activeSignals={0}
      />
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
