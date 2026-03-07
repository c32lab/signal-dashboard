/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  Legend: () => null,
}))

import { vi } from 'vitest'
import { ConfidenceDistribution } from '../../../components/quality/ConfidenceDistribution'
import type { ConfidenceData } from '../../../types'

describe('ConfidenceDistribution', () => {
  it('renders heading', () => {
    render(<ConfidenceDistribution data={{ confidence_buckets: [] }} />)
    expect(screen.getByText('Confidence Distribution')).toBeInTheDocument()
  })

  it('renders chart even with empty buckets (BUCKET_ORDER provides structure)', () => {
    render(<ConfidenceDistribution data={{ confidence_buckets: [] }} />)
    // chartData is built from BUCKET_ORDER so chart always renders
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByText('0 decisions')).toBeInTheDocument()
  })

  it('shows total decisions count', () => {
    const data: ConfidenceData = {
      confidence_buckets: [
        { bucket: 'minimal_0-20', action: 'LONG', decision_type: 'FAST', cnt: 5, avg_conf: 0.15, avg_score: 0.1 },
        { bucket: 'high_50+', action: 'SHORT', decision_type: 'FAST', cnt: 3, avg_conf: 0.55, avg_score: 0.5 },
      ],
    }
    render(<ConfidenceDistribution data={data} />)
    expect(screen.getByText('8 decisions')).toBeInTheDocument()
  })

  it('renders bar chart when data is present', () => {
    const data: ConfidenceData = {
      confidence_buckets: [
        { bucket: 'minimal_0-20', action: 'LONG', decision_type: 'FAST', cnt: 5, avg_conf: 0.15, avg_score: 0.1 },
      ],
    }
    render(<ConfidenceDistribution data={data} />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.queryByText('No data')).not.toBeInTheDocument()
  })

  it('handles zero-count buckets gracefully', () => {
    const data: ConfidenceData = {
      confidence_buckets: [
        { bucket: 'minimal_0-20', action: 'HOLD', decision_type: 'FAST', cnt: 0, avg_conf: 0, avg_score: 0 },
      ],
    }
    render(<ConfidenceDistribution data={data} />)
    expect(screen.getByText('0 decisions')).toBeInTheDocument()
  })
})
