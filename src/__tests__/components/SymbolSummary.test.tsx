/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SymbolSummary from '../../components/history/SymbolSummary'
import type { PerformanceSymbol } from '../../types'

const mockBySymbol: PerformanceSymbol[] = [
  { symbol: 'BTC/USDT', total: 100, correct: 65, accuracy_pct: 65.0, avg_pnl_pct: 2.35 },
  { symbol: 'ETHUSDT', total: 80, correct: 40, accuracy_pct: 50.0, avg_pnl_pct: -1.20 },
]

describe('SymbolSummary', () => {
  it('renders symbol name, total trades, correct count, accuracy, avg PnL', () => {
    render(<SymbolSummary symbol="BTC/USDT" bySymbol={mockBySymbol} />)
    expect(screen.getByText('BTC Performance')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('65')).toBeInTheDocument()
    expect(screen.getByText('65.0%')).toBeInTheDocument()
    expect(screen.getByText('+2.35%')).toBeInTheDocument()
  })

  it('returns null when symbol not found in bySymbol', () => {
    const { container } = render(<SymbolSummary symbol="DOGE/USDT" bySymbol={mockBySymbol} />)
    expect(container.innerHTML).toBe('')
  })

  it('handles symbol format with slash matching non-slash', () => {
    render(<SymbolSummary symbol="ETHUSDT" bySymbol={mockBySymbol} />)
    expect(screen.getByText('ETH Performance')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('-1.20%')).toBeInTheDocument()
  })

  it('handles non-slash symbol matching slash format', () => {
    render(<SymbolSummary symbol="BTCUSDT" bySymbol={mockBySymbol} />)
    expect(screen.getByText('BTC Performance')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
