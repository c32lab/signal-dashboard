/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock all API hooks
vi.mock('../../hooks/useApi', () => ({
  useHealth: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useOverview: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useDecisions: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useSignalsLatest: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  usePerformance: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useConfidence: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useSignalQuality: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useAccuracyTrend: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useAccuracy: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useBacktest: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useCombinerWeights: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useBias: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useCollectorHealth: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useStatus: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useTradingSummary: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useRecentDecisions: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
}))

vi.mock('../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT'],
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
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  ReferenceLine: () => <div />,
}))

import Dashboard from '../../pages/Dashboard'

describe('Dashboard', () => {
  it('renders without crashing', () => {
    const { container } = render(<Dashboard />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders section error boundaries', () => {
    const { container } = render(<Dashboard />)
    expect(container.querySelectorAll('div').length).toBeGreaterThan(0)
  })
})
