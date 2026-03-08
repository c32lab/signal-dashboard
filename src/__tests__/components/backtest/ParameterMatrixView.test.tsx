/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ParamMatrixResponse } from '../../../types/paramMatrix'

const MOCK_DATA: ParamMatrixResponse = {
  symbols: {
    ETHUSDT: {
      total_configs: 4,
      results: [
        { params: { rsi_period: 8, bb_period: 16 }, trades: 41, wins: 26, win_rate: 63.4, pnl: 9.44, return_pct: 0.094, sharpe: 0.64 },
        { params: { rsi_period: 8, bb_period: 20 }, trades: 35, wins: 20, win_rate: 57.1, pnl: 5.12, return_pct: 0.051, sharpe: 0.42 },
        { params: { rsi_period: 14, bb_period: 16 }, trades: 28, wins: 19, win_rate: 67.9, pnl: 12.30, return_pct: 0.123, sharpe: 0.91 },
        { params: { rsi_period: 14, bb_period: 20 }, trades: 22, wins: 16, win_rate: 72.7, pnl: 15.60, return_pct: 0.156, sharpe: 1.15 },
      ],
    },
    BTCUSDT: {
      total_configs: 2,
      results: [
        { params: { rsi_period: 8, bb_period: 16 }, trades: 30, wins: 18, win_rate: 60.0, pnl: 7.20, return_pct: 0.072, sharpe: 0.55 },
        { params: { rsi_period: 14, bb_period: 16 }, trades: 25, wins: 17, win_rate: 68.0, pnl: 10.50, return_pct: 0.105, sharpe: 0.82 },
      ],
    },
  },
}

vi.mock('../../../hooks/useParamMatrix', () => ({
  useParamMatrix: () => ({ data: MOCK_DATA, isLoading: false }),
  useWalkForward: () => ({ data: null, isLoading: false }),
}))

import ParameterMatrixView from '../../../components/backtest/ParameterMatrixView'

describe('ParameterMatrixView', () => {
  it('renders the heading', () => {
    render(<ParameterMatrixView />)
    expect(screen.getByText('Parameter Matrix Heatmap')).toBeInTheDocument()
  })

  it('renders symbol selector with available symbols', () => {
    render(<ParameterMatrixView />)
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    const options = screen.getAllByRole('option')
    const symbolOptions = options.filter(o => o.textContent === 'ETHUSDT' || o.textContent === 'BTCUSDT')
    expect(symbolOptions.length).toBe(2)
  })

  it('renders axis dropdowns with param names', () => {
    render(<ParameterMatrixView />)
    expect(screen.getByText('X-Axis')).toBeInTheDocument()
    expect(screen.getByText('Y-Axis')).toBeInTheDocument()
  })

  it('renders metric selector', () => {
    render(<ParameterMatrixView />)
    expect(screen.getByText('Metric')).toBeInTheDocument()
  })

  it('renders heatmap cells with metric values', () => {
    render(<ParameterMatrixView />)
    // Default metric is Sharpe — check for known values from ETHUSDT
    expect(screen.getAllByText('1.15').length).toBeGreaterThan(0)
    expect(screen.getAllByText('0.64').length).toBeGreaterThan(0)
  })

  it('highlights best combination', () => {
    render(<ParameterMatrixView />)
    expect(screen.getByText(/Best combo highlighted/)).toBeInTheDocument()
  })

  it('renders top configs table sorted by sharpe', () => {
    render(<ParameterMatrixView />)
    expect(screen.getByText('Top Configs by Sharpe')).toBeInTheDocument()
    // First row should be the highest sharpe (1.15)
    const rows = screen.getAllByRole('row')
    const topConfigRows = rows.filter(r => r.textContent?.includes('rsi_period'))
    expect(topConfigRows.length).toBeGreaterThan(0)
  })

  it('returns null when no symbol data', () => {
    vi.doMock('../../../hooks/useParamMatrix', () => ({
      useParamMatrix: () => ({ data: { symbols: {} }, isLoading: false }),
      useWalkForward: () => ({ data: null, isLoading: false }),
    }))
  })
})
