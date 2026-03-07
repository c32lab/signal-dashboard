/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock swr – capture the arguments each hook passes to useSWR
const mockUseSWR = vi.fn().mockReturnValue({ data: undefined, error: undefined, isLoading: true })
vi.mock('swr', () => ({ default: mockUseSWR }))

// Mock api – all methods return resolved promises
const mockApi = {
  health: vi.fn(),
  overview: vi.fn(),
  decisions: vi.fn(),
  signalsLatest: vi.fn(),
  performance: vi.fn(),
  confidence: vi.fn(),
  signalQuality: vi.fn(),
  accuracyTrend: vi.fn(),
  accuracy: vi.fn(),
  backtest: vi.fn(),
  combinerWeights: vi.fn(),
  bias: vi.fn(),
  collectorHealth: vi.fn(),
  status: vi.fn(),
  tradingSummary: vi.fn(),
}
vi.mock('../../api', () => ({ api: mockApi }))

const {
  useHealth,
  useOverview,
  useDecisions,
  useSignalsLatest,
  usePerformance,
  useConfidence,
  useAccuracyTrend,
  useAccuracy,
  useBacktest,
  useCombinerWeights,
  useBias,
  useCollectorHealth,
  useStatus,
  useTradingSummary,
  useRecentDecisions,
} = await import('../../hooks/useApi')

describe('useApi hooks', () => {
  beforeEach(() => {
    mockUseSWR.mockClear()
  })

  it('useHealth passes key "health" with 30s refresh', () => {
    useHealth()
    expect(mockUseSWR).toHaveBeenCalledWith('health', expect.any(Function), { refreshInterval: 30_000 })
  })

  it('useOverview passes key "overview" with 30s refresh', () => {
    useOverview()
    expect(mockUseSWR).toHaveBeenCalledWith('overview', expect.any(Function), { refreshInterval: 30_000 })
  })

  it('useDecisions passes key including serialised params', () => {
    const params = { limit: 5, symbol: 'BTC/USDT' }
    useDecisions(params)
    const [key] = mockUseSWR.mock.calls[0]
    expect(key).toEqual(['decisions', JSON.stringify(params)])
  })

  it('useDecisions with no params serialises empty object', () => {
    useDecisions()
    const [key] = mockUseSWR.mock.calls[0]
    expect(key).toEqual(['decisions', '{}'])
  })

  it('useDecisions fetcher calls api.decisions with params', () => {
    const params = { symbol: 'ETH/USDT' }
    useDecisions(params)
    const fetcher = mockUseSWR.mock.calls[0][1] as () => void
    fetcher()
    expect(mockApi.decisions).toHaveBeenCalledWith(params)
  })

  it('useRecentDecisions passes key with minutes and 15s refresh', () => {
    useRecentDecisions(30)
    const [key, , opts] = mockUseSWR.mock.calls[0]
    expect(key).toEqual(['recent-decisions', 30])
    expect(opts).toEqual({ refreshInterval: 15_000 })
  })

  it('useRecentDecisions fetcher computes correct "from" time', () => {
    const now = new Date('2025-06-15T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    useRecentDecisions(60)
    const fetcher = mockUseSWR.mock.calls[0][1] as () => void
    fetcher()

    const expectedFrom = new Date(now - 60 * 60_000).toISOString()
    expect(mockApi.decisions).toHaveBeenCalledWith({ limit: 50, from: expectedFrom })

    vi.restoreAllMocks()
  })

  it('useAccuracyTrend uses 60s refresh (not default 30s)', () => {
    useAccuracyTrend()
    const [, , opts] = mockUseSWR.mock.calls[0]
    expect(opts).toEqual({ refreshInterval: 60_000 })
  })

  it('useBacktest uses 60s refresh', () => {
    useBacktest()
    const [, , opts] = mockUseSWR.mock.calls[0]
    expect(opts).toEqual({ refreshInterval: 60_000 })
  })

  it('useTradingSummary uses 10s refresh', () => {
    useTradingSummary()
    const [, , opts] = mockUseSWR.mock.calls[0]
    expect(opts).toEqual({ refreshInterval: 10_000 })
  })

  it.each([
    ['useSignalsLatest', useSignalsLatest, 'signals/latest'],
    ['usePerformance', usePerformance, 'performance'],
    ['useConfidence', useConfidence, 'confidence'],
    ['useAccuracy', useAccuracy, 'accuracy'],
    ['useCombinerWeights', useCombinerWeights, 'combiner_weights'],
    ['useBias', useBias, 'bias'],
    ['useCollectorHealth', useCollectorHealth, 'collector-health'],
    ['useStatus', useStatus, 'status'],
  ] as const)('%s passes correct SWR key', (_name, hook, expectedKey) => {
    (hook as () => unknown)()
    const [key] = mockUseSWR.mock.calls[0]
    expect(key).toBe(expectedKey)
  })
})
