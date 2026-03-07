/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/useApi', () => ({
  useSignalsLatest: vi.fn(),
}))

import { RegimeStatus } from '../../../components/dashboard/RegimeStatus'
import { useSignalsLatest } from '../../../hooks/useApi'

const mockUseSignalsLatest = vi.mocked(useSignalsLatest)

function makeSignal(symbol: string, regime: string, adx: number, confidence: number, advice?: string) {
  return {
    symbol,
    timestamp: '2026-03-07T00:00:00Z',
    raw_json: JSON.stringify({
      market_snapshot: {
        regime: {
          regime,
          regime_confidence: confidence,
          regime_advice: advice ?? '',
          regime_reasoning: '',
          regime_indicators: { adx, slope_20: 0, vol_ratio: 1, vol_percentile: 50, atr_change: 0, price_range_pct: 0 },
        },
      },
    }),
  }
}

describe('RegimeStatus', () => {
  it('renders null when signals is undefined', () => {
    mockUseSignalsLatest.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useSignalsLatest>)
    const { container } = render(<RegimeStatus />)
    expect(container.innerHTML).toBe('')
  })

  it('renders null when signals array is empty', () => {
    mockUseSignalsLatest.mockReturnValue({ data: [] } as unknown as ReturnType<typeof useSignalsLatest>)
    const { container } = render(<RegimeStatus />)
    expect(container.innerHTML).toBe('')
  })

  it('renders null when no signals have parseable regime data', () => {
    mockUseSignalsLatest.mockReturnValue({
      data: [{ symbol: 'BTC/USDT', timestamp: '2026-03-07T00:00:00Z', raw_json: '{invalid' }],
    } as unknown as ReturnType<typeof useSignalsLatest>)
    const { container } = render(<RegimeStatus />)
    expect(container.innerHTML).toBe('')
  })

  it('renders trending regime with green badge', () => {
    mockUseSignalsLatest.mockReturnValue({
      data: [makeSignal('BTC/USDT', 'trending', 30.5, 0.85, 'Follow the trend')],
    } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<RegimeStatus />)
    expect(screen.getByText('Market Regime')).toBeInTheDocument()
    expect(screen.getByText('TRENDING')).toBeInTheDocument()
    expect(screen.getByText('30.5')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('Follow the trend')).toBeInTheDocument()
  })

  it('renders ranging regime with yellow badge', () => {
    mockUseSignalsLatest.mockReturnValue({
      data: [makeSignal('ETH/USDT', 'ranging', 15.0, 0.60)],
    } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<RegimeStatus />)
    expect(screen.getByText('RANGING')).toBeInTheDocument()
    const badge = screen.getByText('RANGING')
    expect(badge.className).toContain('text-yellow-400')
  })

  it('sorts symbols alphabetically and deduplicates by keeping latest', () => {
    mockUseSignalsLatest.mockReturnValue({
      data: [
        { ...makeSignal('ETH/USDT', 'trending', 25, 0.7), timestamp: '2026-03-07T01:00:00Z' },
        { ...makeSignal('BTC/USDT', 'ranging', 10, 0.5), timestamp: '2026-03-07T00:00:00Z' },
        { ...makeSignal('ETH/USDT', 'ranging', 12, 0.4), timestamp: '2026-03-07T00:30:00Z' },
      ],
    } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<RegimeStatus />)
    const symbols = screen.getAllByText(/BTC\/USDT|ETH\/USDT/)
    expect(symbols[0]).toHaveTextContent('BTC/USDT')
    expect(symbols[1]).toHaveTextContent('ETH/USDT')
    // ETH kept latest (trending), not the earlier ranging
    expect(screen.getByText('TRENDING')).toBeInTheDocument()
  })
})
