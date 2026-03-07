/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => null,
  CartesianGrid: () => null,
  Legend: () => null,
}))

import { PredictionTable } from '../../../components/predict/PredictionTable'
import type { Prediction } from '../../../types/predict'

function makePrediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: 1,
    timestamp: '2026-03-07T01:00:00Z',
    symbol: 'BTC/USDT',
    direction: 'LONG',
    confidence: 0.72,
    trigger_event: 'ETF inflow surge',
    trigger_pattern: 'etf_inflow_spike',
    expected_impact: 3.5,
    expected_horizon: '24h',
    price_at_prediction: 62000,
    macro_score: 65,
    fear_greed: 55,
    reasoning: 'Strong inflows',
    status: 'active',
    created_at: '2026-03-07T01:00:00Z',
    ...overrides,
  }
}

describe('PredictionTable', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  )

  it('renders prediction rows', () => {
    render(<PredictionTable predictions={[makePrediction(), makePrediction({ id: 2, symbol: 'ETH/USDT' })]} />, { wrapper })
    expect(screen.getByText('BTC/USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH/USDT')).toBeInTheDocument()
  })

  it('renders direction badge', () => {
    render(<PredictionTable predictions={[makePrediction({ direction: 'LONG' })]} />, { wrapper })
    expect(screen.getByText('LONG')).toBeInTheDocument()
  })

  it('renders confidence ×100', () => {
    render(<PredictionTable predictions={[makePrediction({ confidence: 0.72 })]} />, { wrapper })
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('renders expected impact directly (already_pct)', () => {
    render(<PredictionTable predictions={[makePrediction({ expected_impact: 3.5 })]} />, { wrapper })
    expect(screen.getByText('3.5%')).toBeInTheDocument()
  })

  it('renders pattern name', () => {
    render(<PredictionTable predictions={[makePrediction({ trigger_pattern: 'whale_accumulation' })]} />, { wrapper })
    expect(screen.getByText('whale_accumulation')).toBeInTheDocument()
  })
})
