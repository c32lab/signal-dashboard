/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock recharts to avoid canvas/SVG rendering issues in test env
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="chart-line" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ReferenceLine: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import PnlCompareChart from '../../../components/backtest/PnlCompareChart'
import type { PnlCurvePoint, BacktestConfig } from '../../../types/backtest'

const configs: Record<string, BacktestConfig> = {
  A_current: { weights: { momentum: 0.4 }, description: 'Current' },
  B_test: { weights: { momentum: 0.7 }, description: 'Test' },
}

const pnlCurve: Record<string, PnlCurvePoint[]> = {
  A_current: [
    { timestamp: '2025-01-01T00:00:00Z', cumulative_pnl_pct: 1.0 },
    { timestamp: '2025-01-02T00:00:00Z', cumulative_pnl_pct: 2.5 },
  ],
  B_test: [
    { timestamp: '2025-01-01T00:00:00Z', cumulative_pnl_pct: 0.5 },
    { timestamp: '2025-01-02T00:00:00Z', cumulative_pnl_pct: 3.0 },
  ],
}

describe('PnlCompareChart', () => {
  it('renders chart container and title', () => {
    render(<PnlCompareChart pnlCurve={pnlCurve} configs={configs} />)
    expect(screen.getByText('Cumulative PnL%')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders toggle buttons for each config', () => {
    render(<PnlCompareChart pnlCurve={pnlCurve} configs={configs} />)
    expect(screen.getByText('A_current')).toBeInTheDocument()
    expect(screen.getByText('B_test')).toBeInTheDocument()
  })

  it('toggles config visibility on button click', () => {
    render(<PnlCompareChart pnlCurve={pnlCurve} configs={configs} />)
    const toggleBtn = screen.getByText('A_current')
    // Initially visible — bg-gray-800
    expect(toggleBtn.closest('button')!.className).toContain('bg-gray-800')

    fireEvent.click(toggleBtn.closest('button')!)
    // After toggle — bg-gray-950 (hidden)
    expect(toggleBtn.closest('button')!.className).toContain('bg-gray-950')
  })

  it('renders chart lines for visible configs', () => {
    render(<PnlCompareChart pnlCurve={pnlCurve} configs={configs} />)
    const lines = screen.getAllByTestId('chart-line')
    expect(lines).toHaveLength(2)
  })

  it('renders with empty pnlCurve (no configs)', () => {
    render(<PnlCompareChart pnlCurve={{}} configs={{}} />)
    expect(screen.getByText('Cumulative PnL%')).toBeInTheDocument()
  })
})
