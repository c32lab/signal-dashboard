/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock all hooks used by Dashboard
vi.mock('../../hooks/useApi', () => ({
  useOverview: vi.fn(),
  useBias: vi.fn(),
  useHealth: vi.fn(),
  usePerformance: vi.fn(),
  useAccuracy: vi.fn(),
}))

// Mock child components to simple divs
vi.mock('../../components/KPIPanel', () => ({ default: () => <div data-testid="KPIPanel" /> }))
vi.mock('../../components/LiveSignalFeed', () => ({ default: () => <div data-testid="LiveSignalFeed" /> }))
vi.mock('../../components/SignalCards', () => ({ default: () => <div data-testid="SignalCards" /> }))
vi.mock('../../components/CombinerWeights', () => ({ default: () => <div data-testid="CombinerWeights" /> }))
vi.mock('../../components/DecisionTable', () => ({ default: () => <div data-testid="DecisionTable" /> }))
vi.mock('../../components/LastUpdated', () => ({ default: () => <div data-testid="LastUpdated" /> }))
vi.mock('../../components/TradingStatus', () => ({ default: () => <div data-testid="TradingStatus" /> }))
vi.mock('../../components/SectionErrorBoundary', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid={`section-${title}`}>{children}</div>
  ),
}))
vi.mock('../../components/dashboard', () => ({
  HealthSummary: ({ data }: { data: unknown }) => <div data-testid="HealthSummary">{JSON.stringify(data)}</div>,
  AlertsPanel: ({ data }: { data: unknown }) => <div data-testid="AlertsPanel">{JSON.stringify(data)}</div>,
  DecisionDistribution: () => <div data-testid="DecisionDistribution" />,
  SourceBias: ({ data }: { data: unknown }) => <div data-testid="SourceBias">{JSON.stringify(data)}</div>,
  PerformanceOverview: ({ data }: { data: unknown }) => <div data-testid="PerformanceOverview">{JSON.stringify(data)}</div>,
  AccuracyKPI: ({ data }: { data: unknown }) => <div data-testid="AccuracyKPI">{JSON.stringify(data)}</div>,
  AccuracyMiniTrend: () => <div data-testid="AccuracyMiniTrend" />,
  RegimeStatus: () => <div data-testid="RegimeStatus" />,
}))

import Dashboard from '../../pages/Dashboard'
import { useOverview, useBias, useHealth, usePerformance, useAccuracy } from '../../hooks/useApi'

const mockUseOverview = vi.mocked(useOverview)
const mockUseBias = vi.mocked(useBias)
const mockUseHealth = vi.mocked(useHealth)
const mockUsePerformance = vi.mocked(usePerformance)
const mockUseAccuracy = vi.mocked(useAccuracy)

function mockAllLoading() {
  const loading = { data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useOverview>
  mockUseOverview.mockReturnValue(loading)
  mockUseBias.mockReturnValue(loading as unknown as ReturnType<typeof useBias>)
  mockUseHealth.mockReturnValue(loading as unknown as ReturnType<typeof useHealth>)
  mockUsePerformance.mockReturnValue(loading as unknown as ReturnType<typeof usePerformance>)
  mockUseAccuracy.mockReturnValue(loading as unknown as ReturnType<typeof useAccuracy>)
}

function mockAllWithData() {
  mockUseOverview.mockReturnValue({ data: { total: 100 }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useOverview>)
  mockUseBias.mockReturnValue({ data: { source_bias: 'bull' }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useBias>)
  mockUseHealth.mockReturnValue({ data: { status: 'ok' }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useHealth>)
  mockUsePerformance.mockReturnValue({ data: { overall: { win_rate: 0.6 } }, isLoading: false, error: undefined } as unknown as ReturnType<typeof usePerformance>)
  mockUseAccuracy.mockReturnValue({ data: { overall: 0.75 }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useAccuracy>)
}

describe('Dashboard', () => {
  it('renders without crashing when loading', () => {
    mockAllLoading()
    const { container } = render(<Dashboard />)
    expect(container.querySelector('.p-4')).toBeInTheDocument()
  })

  it('renders LastUpdated and always-visible components', () => {
    mockAllLoading()
    render(<Dashboard />)
    expect(screen.getByTestId('LastUpdated')).toBeInTheDocument()
    expect(screen.getByTestId('RegimeStatus')).toBeInTheDocument()
    expect(screen.getByTestId('AccuracyMiniTrend')).toBeInTheDocument()
    expect(screen.getByTestId('LiveSignalFeed')).toBeInTheDocument()
    expect(screen.getByTestId('KPIPanel')).toBeInTheDocument()
    expect(screen.getByTestId('TradingStatus')).toBeInTheDocument()
    expect(screen.getByTestId('CombinerWeights')).toBeInTheDocument()
    expect(screen.getByTestId('DecisionDistribution')).toBeInTheDocument()
    expect(screen.getByTestId('SignalCards')).toBeInTheDocument()
    expect(screen.getByTestId('DecisionTable')).toBeInTheDocument()
  })

  it('hides data-dependent sections when data is undefined', () => {
    mockAllLoading()
    render(<Dashboard />)
    expect(screen.queryByTestId('AlertsPanel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('HealthSummary')).not.toBeInTheDocument()
    expect(screen.queryByTestId('AccuracyKPI')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PerformanceOverview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('SourceBias')).not.toBeInTheDocument()
  })

  it('renders data-dependent sections when data is available', () => {
    mockAllWithData()
    render(<Dashboard />)
    expect(screen.getByTestId('AlertsPanel')).toBeInTheDocument()
    expect(screen.getByTestId('HealthSummary')).toBeInTheDocument()
    expect(screen.getByTestId('AccuracyKPI')).toBeInTheDocument()
    expect(screen.getByTestId('PerformanceOverview')).toBeInTheDocument()
    expect(screen.getByTestId('SourceBias')).toBeInTheDocument()
  })

  it('passes correct data props to child components', () => {
    mockAllWithData()
    render(<Dashboard />)
    expect(screen.getByTestId('HealthSummary')).toHaveTextContent('"status":"ok"')
    expect(screen.getByTestId('SourceBias')).toHaveTextContent('"source_bias":"bull"')
  })
})
