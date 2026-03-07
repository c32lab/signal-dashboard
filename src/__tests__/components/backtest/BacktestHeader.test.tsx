/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BacktestHeader from '../../../components/backtest/BacktestHeader'

describe('BacktestHeader', () => {
  it('renders title', () => {
    render(<BacktestHeader generatedAt="2026-03-01T00:00:00Z" totalTrades={100} />)
    expect(screen.getByText('Backtest A/B Test')).toBeInTheDocument()
  })

  it('displays total trades count', () => {
    render(<BacktestHeader generatedAt="2026-03-01T00:00:00Z" totalTrades={180} />)
    expect(screen.getByText('180 笔交易')).toBeInTheDocument()
  })

  it('displays data range when provided', () => {
    render(
      <BacktestHeader
        generatedAt="2026-03-01T00:00:00Z"
        dataRange={{ start: '2026-01-01', end: '2026-03-01' }}
        totalTrades={50}
      />
    )
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument()
  })

  it('hides data range when not provided', () => {
    render(<BacktestHeader generatedAt="2026-03-01T00:00:00Z" totalTrades={50} />)
    expect(screen.queryByText(/2026-01-01/)).toBeNull()
  })
})
