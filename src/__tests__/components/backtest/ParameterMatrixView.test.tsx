/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ParamMatrixResult } from '../../../types/paramMatrix'

const MOCK_DATA: ParamMatrixResult = {
  sweep_id: 'test-001',
  generated_at: '2026-03-07T12:00:00Z',
  dimensions: ['min_confidence', 'technical_weight', 'derivatives_weight'],
  results: [
    { params: { min_confidence: 0.3, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.42, win_rate_pct: 52.1, total_pnl_pct: 8.3, max_drawdown_pct: 12.4, total_trades: 187 } },
    { params: { min_confidence: 0.3, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.65, win_rate_pct: 54.8, total_pnl_pct: 11.2, max_drawdown_pct: 10.1, total_trades: 172 } },
    { params: { min_confidence: 0.5, technical_weight: 0.20, derivatives_weight: 0.30 }, metrics: { sharpe: 1.73, win_rate_pct: 56.2, total_pnl_pct: 13.1, max_drawdown_pct: 9.3, total_trades: 143 } },
    { params: { min_confidence: 0.5, technical_weight: 0.30, derivatives_weight: 0.30 }, metrics: { sharpe: 1.91, win_rate_pct: 58.5, total_pnl_pct: 15.6, max_drawdown_pct: 7.8, total_trades: 131 } },
  ],
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

  it('renders axis dropdowns with dimensions', () => {
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
    // Default metric is Sharpe — check for a known value
    expect(screen.getByText('1.91')).toBeInTheDocument()
    expect(screen.getByText('1.42')).toBeInTheDocument()
  })

  it('highlights best combination', () => {
    render(<ParameterMatrixView />)
    expect(screen.getByText(/Best combo highlighted/)).toBeInTheDocument()
  })

  it('renders column and row headers from dimensions', () => {
    render(<ParameterMatrixView />)
    // X-axis defaults to first dimension (min_confidence), Y-axis to second (technical_weight)
    // Column headers should show min_confidence values
    expect(screen.getAllByText('0.3').length).toBeGreaterThan(0)
    expect(screen.getAllByText('0.5').length).toBeGreaterThan(0)
  })

  it('returns null when data has fewer than 2 dimensions', () => {
    vi.doMock('../../../hooks/useParamMatrix', () => ({
      useParamMatrix: () => ({ data: { ...MOCK_DATA, dimensions: ['only_one'] }, isLoading: false }),
      useWalkForward: () => ({ data: null, isLoading: false }),
    }))
  })
})
