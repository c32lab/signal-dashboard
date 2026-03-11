/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useOverview: vi.fn(),
  useAccuracySummary: vi.fn(),
  useSignalsLatest: vi.fn(),
}))

import KPIPanel from '../../components/KPIPanel'
import { useOverview, useAccuracySummary, useSignalsLatest } from '../../hooks/useApi'

const mockUseOverview = vi.mocked(useOverview)
const mockUseAccuracySummary = vi.mocked(useAccuracySummary)
const mockUseSignalsLatest = vi.mocked(useSignalsLatest)

function makeOverview() {
  return {
    total_decisions: 1500,
    recent_1h: { BTC: 5, ETH: 3 },
    action_distribution: { LONG: 700, SHORT: 500, HOLD: 300 },
    symbol_distribution: { 'BTC/USDT': 800, 'ETH/USDT': 500, 'SOL/USDT': 200 },
    type_distribution: { FAST: 900, SLOW: 600 },
  }
}

function makeAccuracySummary(accuracy24h = 72.5, accuracy7d = 68.0) {
  return {
    windows: {
      '24h': { total: 100, accuracy_1h_pct: accuracy24h, accuracy_4h_pct: 75.0, by_symbol: {}, by_direction: {} },
      '7d': { total: 500, accuracy_1h_pct: accuracy7d, accuracy_4h_pct: 70.0, by_symbol: {}, by_direction: {} },
      '30d': { total: 2000, accuracy_1h_pct: 65.0, accuracy_4h_pct: 68.0, by_symbol: {}, by_direction: {} },
    },
  }
}

function setupMocks(
  overviewData = makeOverview(),
  accuracyData = makeAccuracySummary(),
  overviewLoading = false,
  overviewError: Error | undefined = undefined,
  latestSignals: Array<{ timestamp: string }> | undefined = undefined,
) {
  mockUseOverview.mockReturnValue({ data: overviewData, isLoading: overviewLoading, error: overviewError } as unknown as ReturnType<typeof useOverview>)
  mockUseAccuracySummary.mockReturnValue({ data: accuracyData } as unknown as ReturnType<typeof useAccuracySummary>)
  mockUseSignalsLatest.mockReturnValue({ data: latestSignals } as unknown as ReturnType<typeof useSignalsLatest>)
}

describe('KPIPanel', () => {
  it('renders loading state', () => {
    mockUseOverview.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useOverview>)
    mockUseAccuracySummary.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useAccuracySummary>)
    mockUseSignalsLatest.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<KPIPanel />)
    expect(screen.getByText('Loading overview…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseOverview.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Server down') } as unknown as ReturnType<typeof useOverview>)
    mockUseAccuracySummary.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useAccuracySummary>)
    mockUseSignalsLatest.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<KPIPanel />)
    expect(screen.getByText(/Failed to load overview/)).toBeInTheDocument()
    expect(screen.getByText(/Server down/)).toBeInTheDocument()
  })

  it('renders total decisions count', () => {
    setupMocks()
    render(<KPIPanel />)
    expect(screen.getByText('1,500')).toBeInTheDocument()
    expect(screen.getByText('Total Decisions')).toBeInTheDocument()
  })

  it('renders direction distribution (LONG/SHORT/HOLD)', () => {
    setupMocks()
    render(<KPIPanel />)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('HOLD')).toBeInTheDocument()
    expect(screen.getByText('700')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('By Direction')).toBeInTheDocument()
  })

  it('renders symbol distribution', () => {
    setupMocks()
    render(<KPIPanel />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('SOL')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
  })

  it('renders last 1h total', () => {
    setupMocks()
    render(<KPIPanel />)
    expect(screen.getByText('8')).toBeInTheDocument() // 5 + 3
    expect(screen.getByText('Last 1h')).toBeInTheDocument()
  })

  it('renders accuracy card with delta badge', () => {
    setupMocks()
    render(<KPIPanel />)
    expect(screen.getByText('Accuracy (1h)')).toBeInTheDocument()
    expect(screen.getByText('72.5%')).toBeInTheDocument()
    expect(screen.getByText('vs 7d')).toBeInTheDocument()
  })

  it('shows critical anomaly when accuracy below 50%', () => {
    setupMocks(makeOverview(), makeAccuracySummary(45.0, 68.0))
    render(<KPIPanel />)
    expect(screen.getByText('Accuracy below 50%')).toBeInTheDocument()
  })

  it('shows warning anomaly when no signals in last hour', () => {
    const overview = makeOverview()
    overview.recent_1h = { BTC: 0, ETH: 0 }
    setupMocks(overview)
    render(<KPIPanel />)
    expect(screen.getByText('No signals in last hour')).toBeInTheDocument()
  })

  it('renders without accuracy card when data is unavailable', () => {
    mockUseOverview.mockReturnValue({ data: makeOverview(), isLoading: false, error: undefined } as unknown as ReturnType<typeof useOverview>)
    mockUseAccuracySummary.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useAccuracySummary>)
    mockUseSignalsLatest.mockReturnValue({ data: undefined } as unknown as ReturnType<typeof useSignalsLatest>)
    render(<KPIPanel />)
    expect(screen.queryByText('Accuracy (1h)')).not.toBeInTheDocument()
  })

  it('shows critical anomaly when all signals are older than 4 hours', () => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    const staleSignals = [
      { timestamp: fiveHoursAgo },
      { timestamp: fiveHoursAgo },
    ]
    setupMocks(makeOverview(), makeAccuracySummary(), false, undefined, staleSignals)
    render(<KPIPanel />)
    expect(screen.getByText('No signals for 4h+')).toBeInTheDocument()
  })

  it('does not show 4h drought warning when recent signals exist', () => {
    const recentSignals = [
      { timestamp: new Date().toISOString() },
    ]
    setupMocks(makeOverview(), makeAccuracySummary(), false, undefined, recentSignals)
    render(<KPIPanel />)
    expect(screen.queryByText('No signals for 4h+')).not.toBeInTheDocument()
  })

  it('does not show 4h drought warning when signals data is not loaded', () => {
    setupMocks(makeOverview(), makeAccuracySummary(), false, undefined, undefined)
    render(<KPIPanel />)
    expect(screen.queryByText('No signals for 4h+')).not.toBeInTheDocument()
  })
})
