/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  LabelList: () => <div />,
}))

vi.mock('../../hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}))

import CombinerWeightsChart from '../../components/CombinerWeightsChart'

const entries = [
  { source: 'RSI', weight: 0.35, disabled: false },
  { source: 'MACD', weight: 0.25, disabled: false },
  { source: 'BB', weight: 0, disabled: true },
]

describe('CombinerWeightsChart', () => {
  it('renders bar chart', () => {
    const { getByTestId } = render(<CombinerWeightsChart entries={entries} />)
    expect(getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders without crashing with empty entries', () => {
    const { container } = render(<CombinerWeightsChart entries={[]} />)
    expect(container).toBeTruthy()
  })

  it('renders with single entry', () => {
    const { getByTestId } = render(
      <CombinerWeightsChart entries={[{ source: 'RSI', weight: 0.5, disabled: false }]} />
    )
    expect(getByTestId('bar-chart')).toBeInTheDocument()
  })
})
