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
})
