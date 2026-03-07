/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock swr
const mockUseSWR = vi.fn().mockReturnValue({ data: undefined, error: undefined, isLoading: true })
vi.mock('swr', () => ({ default: mockUseSWR }))

// Mock api
const mockApi = {
  decisions: vi.fn(),
}
vi.mock('../../api', () => ({ api: mockApi }))

const { useTimelineData } = await import('../../hooks/useTimelineData')

describe('useTimelineData', () => {
  beforeEach(() => {
    mockUseSWR.mockClear()
    mockApi.decisions.mockClear()
  })

  it('passes limit and offset to useDecisions filters', () => {
    renderHook(() => useTimelineData({ limit: 20, offset: 0 }))
    const [key] = mockUseSWR.mock.calls[0]
    const filters = JSON.parse(key[1])
    expect(filters).toEqual({ limit: 20, offset: 0 })
  })

  it('includes symbol in filters when provided', () => {
    renderHook(() => useTimelineData({ limit: 10, offset: 0, symbol: 'BTC/USDT' }))
    const [key] = mockUseSWR.mock.calls[0]
    const filters = JSON.parse(key[1])
    expect(filters).toMatchObject({ symbol: 'BTC/USDT', limit: 10, offset: 0 })
  })

  it('does NOT include direction in filters (client-side only)', () => {
    renderHook(() => useTimelineData({ limit: 10, offset: 0, direction: 'LONG' }))
    const [key] = mockUseSWR.mock.calls[0]
    const filters = JSON.parse(key[1])
    expect(filters).not.toHaveProperty('direction')
  })

  it('computes from ISO string when hours is provided', () => {
    const now = new Date('2026-03-07T12:00:00Z').getTime()
    vi.spyOn(Date, 'now').mockReturnValue(now)

    renderHook(() => useTimelineData({ limit: 10, offset: 0, hours: 6 }))
    const [key] = mockUseSWR.mock.calls[0]
    const filters = JSON.parse(key[1])

    // hours=6 → from = now - 6*3600000, rounded to minute
    const expectedMs = Math.floor(now / 60_000) * 60_000 - 6 * 3600_000
    expect(filters.from).toBe(new Date(expectedMs).toISOString())

    vi.restoreAllMocks()
  })

  it('does not include from when hours is not provided', () => {
    renderHook(() => useTimelineData({ limit: 10, offset: 0 }))
    const [key] = mockUseSWR.mock.calls[0]
    const filters = JSON.parse(key[1])
    expect(filters).not.toHaveProperty('from')
  })

  it('returns SWR result from useDecisions', () => {
    const mockResult = { data: { decisions: [], total: 0 }, error: undefined, isLoading: false }
    mockUseSWR.mockReturnValueOnce(mockResult)

    const { result } = renderHook(() => useTimelineData({ limit: 10, offset: 0 }))
    expect(result.current).toBe(mockResult)
  })
})
