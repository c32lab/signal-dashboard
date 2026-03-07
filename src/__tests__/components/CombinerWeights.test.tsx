/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useCombinerWeights: vi.fn(),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  LabelList: () => null,
}))

import CombinerWeights from '../../components/CombinerWeights'
import { useCombinerWeights } from '../../hooks/useApi'

const mockUseCombinerWeights = vi.mocked(useCombinerWeights)

describe('CombinerWeights', () => {
  it('renders loading state', () => {
    mockUseCombinerWeights.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useCombinerWeights>)
    render(<CombinerWeights />)
    expect(screen.getByText('Loading combiner weights…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseCombinerWeights.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Network error') } as unknown as ReturnType<typeof useCombinerWeights>)
    render(<CombinerWeights />)
    expect(screen.getByText(/Network error/)).toBeInTheDocument()
  })

  it('renders empty state when no weights data', () => {
    mockUseCombinerWeights.mockReturnValue({ data: { weights: {} }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useCombinerWeights>)
    render(<CombinerWeights />)
    expect(screen.getByText('No combiner weights data')).toBeInTheDocument()
  })

  it('renders empty state when weights is undefined', () => {
    mockUseCombinerWeights.mockReturnValue({ data: {}, isLoading: false, error: undefined } as unknown as ReturnType<typeof useCombinerWeights>)
    render(<CombinerWeights />)
    expect(screen.getByText('No combiner weights data')).toBeInTheDocument()
  })

  it('renders chart when weights data is present', () => {
    mockUseCombinerWeights.mockReturnValue({
      data: { weights: { rsi: 0.3, macd: 0.2, volume: 0.1 } },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useCombinerWeights>)
    render(<CombinerWeights />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders heading "Combiner Source Weights"', () => {
    mockUseCombinerWeights.mockReturnValue({
      data: { weights: { rsi: 0.3 } },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useCombinerWeights>)
    render(<CombinerWeights />)
    expect(screen.getByText('Combiner Source Weights')).toBeInTheDocument()
  })
})
