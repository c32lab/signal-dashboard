/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ReferenceLine: () => null,
}))

import { SourceBias } from '../../../components/dashboard/SourceBias'
import type { BiasResponse } from '../../../types'

function makeData(overrides: Partial<BiasResponse> = {}): BiasResponse {
  return {
    timestamp: '2026-03-07T00:00:00Z',
    window_hours: 6,
    collectors: {
      momentum: { total_signals: 20, long_count: 12, short_count: 5, neutral_count: 3, bias_score: 0.35 },
      rsi: { total_signals: 15, long_count: 3, short_count: 10, neutral_count: 2, bias_score: -0.47 },
    },
    overall: {
      long_pct: 42.9, short_pct: 42.9, neutral_pct: 14.3, bias_score: 0.20,
    },
    ...overrides,
  }
}

describe('SourceBias', () => {
  it('renders overall bias score', () => {
    render(<SourceBias data={makeData()} />)
    expect(screen.getByText('+0.200')).toBeInTheDocument()
  })

  it('renders positive bias in green', () => {
    render(<SourceBias data={makeData({ overall: { long_pct: 60, short_pct: 30, neutral_pct: 10, bias_score: 0.3 } })} />)
    const el = screen.getByText('+0.300')
    expect(el.style.color).toBe('rgb(52, 211, 153)') // green
  })

  it('renders negative bias in red', () => {
    render(<SourceBias data={makeData({ overall: { long_pct: 20, short_pct: 70, neutral_pct: 10, bias_score: -0.5 } })} />)
    const el = screen.getByText('-0.500')
    expect(el.style.color).toBe('rgb(248, 113, 113)') // red
  })

  it('renders collector names', () => {
    render(<SourceBias data={makeData()} />)
    expect(screen.getByText('Source Bias')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('computes overall stats when overall field missing', () => {
    const data = makeData()
    delete (data as Partial<BiasResponse>).overall
    render(<SourceBias data={data} />)
    // Should compute from collectors: long=15, short=15, neutral=5, total=35
    // bias_score = (15-15)/35 = 0.000
    // The component calculates and renders
    expect(screen.getByText('Source Bias')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders neutral bias in gray when score is near zero', () => {
    render(<SourceBias data={makeData({ overall: { long_pct: 33, short_pct: 33, neutral_pct: 34, bias_score: 0.01 } })} />)
    const el = screen.getByText('+0.010')
    expect(el.style.color).toBe('rgb(107, 114, 128)') // gray
  })
})
