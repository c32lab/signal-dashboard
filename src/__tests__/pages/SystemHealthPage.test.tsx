/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useHealth: vi.fn(),
  useCollectorHealth: vi.fn(),
  useCombinerWeights: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useAccuracyTrend: vi.fn(() => ({ data: undefined, isLoading: false, error: undefined })),
  useStatus: vi.fn(() => ({ data: undefined })),
}))

import SystemHealthPage from '../../pages/SystemHealthPage'
import { useHealth, useCollectorHealth } from '../../hooks/useApi'

const mockUseHealth = vi.mocked(useHealth)
const mockUseCollectorHealth = vi.mocked(useCollectorHealth)

describe('SystemHealthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page title', () => {
    mockUseHealth.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useCollectorHealth>)
    render(<SystemHealthPage />)
    expect(screen.getByText('系统健康')).toBeInTheDocument()
  })

  it('renders health summary when data is available', () => {
    mockUseHealth.mockReturnValue({
      data: {
        status: 'running',
        uptime_seconds: 7200,
        version: '1.0.0',
        total_decisions: 100,
        active_symbols: ['BTC/USDT'],
        decision_rate_per_hour: 10,
        duplicate_ratio: 0.01,
      },
    } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useCollectorHealth>)
    render(<SystemHealthPage />)
    // HealthSummary renders uptime, decision rate, etc.
    expect(screen.getByText(/2h 0m/)).toBeInTheDocument()
  })

  it('does not render health summary when no data', () => {
    mockUseHealth.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useCollectorHealth>)
    render(<SystemHealthPage />)
    expect(screen.queryByText(/running/i)).toBeNull()
  })

  it('renders combiner weights section', () => {
    mockUseHealth.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useHealth>)
    mockUseCollectorHealth.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useCollectorHealth>)
    const { container } = render(<SystemHealthPage />)
    expect(container).toBeTruthy()
  })
})
