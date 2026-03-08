/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { normalizeBacktestResults } from '../../utils/backtestNormalizer'

vi.mock('../../utils/backtestNormalizer', () => ({
  normalizeBacktestResults: vi.fn((x: unknown) => x),
}))

// We import api AFTER mocking so the module picks up our mock
// but fetch needs to be mocked at global level
const mockFetch = vi.fn() as Mock
globalThis.fetch = mockFetch

// Dynamic import so the mock is in place
const { api } = await import('../../api')

function okResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve(body),
  }
}

function errorResponse(status: number, statusText: string) {
  return {
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({}),
  }
}

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('health() calls /api/health', async () => {
    const data = { status: 'ok' }
    mockFetch.mockResolvedValue(okResponse(data))

    const result = await api.health()
    expect(result).toEqual(data)
    expect(mockFetch).toHaveBeenCalledWith('/api/health')
  })

  it('decisions() with no params calls /api/decisions', async () => {
    const data = { decisions: [], total: 0 }
    mockFetch.mockResolvedValue(okResponse(data))

    const result = await api.decisions()
    expect(result).toEqual(data)
    expect(mockFetch).toHaveBeenCalledWith('/api/decisions')
  })

  it('decisions() with params appends query string', async () => {
    const data = { decisions: [], total: 0 }
    mockFetch.mockResolvedValue(okResponse(data))

    await api.decisions({ limit: 10, symbol: 'BTC/USDT', from: '2025-01-01' })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('/api/decisions?')
    expect(url).toContain('limit=10')
    expect(url).toContain('symbol=BTC%2FUSDT')
    expect(url).toContain('from=2025-01-01')
  })

  it('backtest() calls normalizeBacktestResults on the raw results', async () => {
    const raw = [{ id: 1 }]
    mockFetch.mockResolvedValue(okResponse({ results: raw }))

    await api.backtest()
    expect(normalizeBacktestResults).toHaveBeenCalledWith(raw)
  })

  it('throws when fetch rejects (network error)', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(api.health()).rejects.toThrow('Failed to fetch')
  })

  it('throws with status info when response is not ok', async () => {
    mockFetch.mockResolvedValue(errorResponse(500, 'Internal Server Error'))

    await expect(api.health()).rejects.toThrow('API error: 500 Internal Server Error')
  })

  it('decisions() with all filter params', async () => {
    mockFetch.mockResolvedValue(okResponse({ decisions: [], total: 0 }))
    await api.decisions({ limit: 10, offset: 5, symbol: 'BTC', type: 'FAST', action: 'LONG', direction: 'LONG', from: '2025-01-01', to: '2025-12-31' })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('offset=5')
    expect(url).toContain('type=FAST')
    expect(url).toContain('action=LONG')
    expect(url).toContain('direction=LONG')
    expect(url).toContain('to=2025-12-31')
  })

  it('overview() calls /api/overview', async () => {
    mockFetch.mockResolvedValue(okResponse({ total_decisions: 100 }))
    const result = await api.overview()
    expect(result).toEqual({ total_decisions: 100 })
    expect(mockFetch).toHaveBeenCalledWith('/api/overview')
  })

  it('decision(id) calls /api/decisions/:id', async () => {
    mockFetch.mockResolvedValue(okResponse({ id: '123' }))
    const result = await api.decision('123')
    expect(result).toEqual({ id: '123' })
    expect(mockFetch).toHaveBeenCalledWith('/api/decisions/123')
  })

  it('signalsLatest() extracts signals array', async () => {
    const signals = [{ id: '1' }]
    mockFetch.mockResolvedValue(okResponse({ signals }))
    const result = await api.signalsLatest()
    expect(result).toEqual(signals)
    expect(mockFetch).toHaveBeenCalledWith('/api/signals/latest')
  })

  it('performance() calls /api/performance', async () => {
    mockFetch.mockResolvedValue(okResponse({ overall: {} }))
    await api.performance()
    expect(mockFetch).toHaveBeenCalledWith('/api/performance')
  })

  it('confidence() calls /api/confidence', async () => {
    mockFetch.mockResolvedValue(okResponse({ buckets: [] }))
    await api.confidence()
    expect(mockFetch).toHaveBeenCalledWith('/api/confidence')
  })

  it('signalQuality() includes hours param', async () => {
    mockFetch.mockResolvedValue(okResponse({ by_symbol: {} }))
    await api.signalQuality(12)
    expect(mockFetch).toHaveBeenCalledWith('/api/signal_quality?hours=12')
  })

  it('signalQuality() defaults to 6 hours', async () => {
    mockFetch.mockResolvedValue(okResponse({ by_symbol: {} }))
    await api.signalQuality()
    expect(mockFetch).toHaveBeenCalledWith('/api/signal_quality?hours=6')
  })

  it('accuracyTrend() extracts trend array', async () => {
    const trend = [{ hour: '2026-03-07' }]
    mockFetch.mockResolvedValue(okResponse({ trend }))
    const result = await api.accuracyTrend()
    expect(result).toEqual(trend)
    expect(mockFetch).toHaveBeenCalledWith('/api/accuracy/trend?hours=24')
  })

  it('accuracyTrend() accepts custom hours', async () => {
    mockFetch.mockResolvedValue(okResponse({ trend: [] }))
    await api.accuracyTrend(12)
    expect(mockFetch).toHaveBeenCalledWith('/api/accuracy/trend?hours=12')
  })

  it('accuracy() calls /api/accuracy', async () => {
    mockFetch.mockResolvedValue(okResponse({ overall: {} }))
    await api.accuracy()
    expect(mockFetch).toHaveBeenCalledWith('/api/accuracy')
  })

  it('combinerWeights() calls /api/combiner_weights', async () => {
    mockFetch.mockResolvedValue(okResponse({ weights: {} }))
    await api.combinerWeights()
    expect(mockFetch).toHaveBeenCalledWith('/api/combiner_weights')
  })

  it('bias() calls /api/bias', async () => {
    mockFetch.mockResolvedValue(okResponse({ collectors: {} }))
    await api.bias()
    expect(mockFetch).toHaveBeenCalledWith('/api/bias')
  })

  it('collectorHealth() calls /api/collector-health', async () => {
    mockFetch.mockResolvedValue(okResponse({ collectors: [] }))
    await api.collectorHealth()
    expect(mockFetch).toHaveBeenCalledWith('/api/collector-health')
  })

  it('tradingSummary() calls /api/trading/summary', async () => {
    mockFetch.mockResolvedValue(okResponse({ balance: 1000 }))
    await api.tradingSummary()
    expect(mockFetch).toHaveBeenCalledWith('/api/trading/summary')
  })

  it('backtest() handles missing results field', async () => {
    mockFetch.mockResolvedValue(okResponse({}))
    await api.backtest()
    expect(normalizeBacktestResults).toHaveBeenCalledWith([])
  })
})
