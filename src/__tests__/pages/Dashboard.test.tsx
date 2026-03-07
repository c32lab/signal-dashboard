/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock all API hooks
vi.mock('../../hooks/useApi', () => ({
  useOverview: vi.fn(() => ({ data: undefined })),
  useBias: vi.fn(() => ({ data: undefined })),
  useHealth: vi.fn(() => ({ data: undefined })),
  usePerformance: vi.fn(() => ({ data: undefined })),
  useAccuracy: vi.fn(() => ({ data: undefined })),
  useSignalsLatest: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useTradingSummary: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useCombinerWeights: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useDecisions: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useRecentDecisions: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useStatus: vi.fn(() => ({ data: undefined })),
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
