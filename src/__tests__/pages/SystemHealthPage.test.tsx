/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock hooks
vi.mock('../../hooks/useApi', () => ({
  useHealth: vi.fn(),
  useCollectorHealth: vi.fn(),
}))

// Mock child components
vi.mock('../../components/CombinerWeights', () => ({ default: () => <div data-testid="CombinerWeights" /> }))
vi.mock('../../components/SectionErrorBoundary', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid={`section-${title}`}>{children}</div>
  ),
}))
vi.mock('../../components/dashboard', () => ({
  HealthSummary: ({ data }: { data: unknown }) => <div data-testid="HealthSummary">{JSON.stringify(data)}</div>,
  CollectorStatus: ({ data }: { data: unknown }) => <div data-testid="CollectorStatus">{JSON.stringify(data)}</div>,
}))

import SystemHealthPage from '../../pages/SystemHealthPage'
import { useHealth, useCollectorHealth } from '../../hooks/useApi'

const mockUseHealth = vi.mocked(useHealth)
const mockUseCollectorHealth = vi.mocked(useCollectorHealth)

describe('SystemHealthPage', () => {
  it('renders page title and CombinerWeights always', () => {
    mockUseHealth.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useCollectorHealth>)
    render(<SystemHealthPage />)
    expect(screen.getByText('系统健康')).toBeInTheDocument()
    expect(screen.getByTestId('CombinerWeights')).toBeInTheDocument()
  })

  it('hides HealthSummary and CollectorStatus when data is undefined', () => {
    mockUseHealth.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useCollectorHealth>)
    render(<SystemHealthPage />)
    expect(screen.queryByTestId('HealthSummary')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CollectorStatus')).not.toBeInTheDocument()
  })

  it('renders HealthSummary and CollectorStatus when data is available', () => {
    mockUseHealth.mockReturnValue({
      data: { status: 'healthy', uptime: 3600 },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({
      data: { collectors: [{ name: 'binance', status: 'ok' }] },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useCollectorHealth>)
    render(<SystemHealthPage />)
    expect(screen.getByTestId('HealthSummary')).toBeInTheDocument()
    expect(screen.getByTestId('HealthSummary')).toHaveTextContent('"status":"healthy"')
    expect(screen.getByTestId('CollectorStatus')).toBeInTheDocument()
    expect(screen.getByTestId('CollectorStatus')).toHaveTextContent('binance')
  })

  it('renders only HealthSummary when collector data is missing', () => {
    mockUseHealth.mockReturnValue({
      data: { status: 'healthy' },
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({ data: undefined, isLoading: false, error: undefined } as unknown as ReturnType<typeof useCollectorHealth>)
    render(<SystemHealthPage />)
    expect(screen.getByTestId('HealthSummary')).toBeInTheDocument()
    expect(screen.queryByTestId('CollectorStatus')).not.toBeInTheDocument()
  })
})
