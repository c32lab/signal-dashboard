/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  usePerformance: vi.fn(() => ({ data: undefined, isLoading: true, error: undefined })),
  useAccuracyTrend: vi.fn(() => ({ data: undefined, isLoading: true, error: undefined })),
  useSignalQuality: vi.fn(() => ({ data: undefined, isLoading: true, error: undefined })),
  useAccuracy: vi.fn(() => ({ data: undefined, isLoading: true, error: undefined })),
  useConfidence: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useCombinerWeights: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  Cell: () => <div />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
}))

import QualityTracker from '../../pages/QualityTracker'

describe('QualityTracker', () => {
  it('renders without crashing', () => {
    const { container } = render(<QualityTracker />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows loading skeletons for performance', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading overall performance…')).toBeInTheDocument()
  })

  it('shows loading skeletons for accuracy', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading accuracy overview…')).toBeInTheDocument()
  })

  it('shows loading for leaderboard', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading leaderboard…')).toBeInTheDocument()
  })

  it('shows loading for trend', () => {
    render(<QualityTracker />)
    expect(screen.getByText('Loading trend…')).toBeInTheDocument()
  })
})
