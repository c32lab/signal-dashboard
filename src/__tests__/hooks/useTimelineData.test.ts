/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

const mockUseDecisions = vi.fn()

vi.mock('../../hooks/useApi', () => ({
  useDecisions: (filters: unknown) => mockUseDecisions(filters),
}))

import { useTimelineData } from '../../hooks/useTimelineData'

describe('useTimelineData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDecisions.mockReturnValue({
      data: { decisions: [], total: 0 },
      isLoading: false,
      error: undefined,
    })
  })

  it('passes limit and offset to useDecisions', () => {
    renderHook(() => useTimelineData({ limit: 30, offset: 0 }))
    expect(mockUseDecisions).toHaveBeenCalled()
    const filters = mockUseDecisions.mock.calls[0][0]
    expect(filters.limit).toBe(30)
    expect(filters.offset).toBe(0)
  })

  it('passes symbol filter when provided', () => {
    renderHook(() => useTimelineData({ symbol: 'BTC/USDT', limit: 30, offset: 0 }))
    const filters = mockUseDecisions.mock.calls[0][0]
    expect(filters.symbol).toBe('BTC/USDT')
  })

  it('does not pass symbol when not provided', () => {
    renderHook(() => useTimelineData({ limit: 30, offset: 0 }))
    const filters = mockUseDecisions.mock.calls[0][0]
    expect(filters.symbol).toBeUndefined()
  })

  it('computes from timestamp when hours is provided', () => {
    renderHook(() => useTimelineData({ hours: 6, limit: 30, offset: 0 }))
    const filters = mockUseDecisions.mock.calls[0][0]
    expect(filters.from).toBeDefined()
    // The from time should be approximately 6 hours ago
    const fromTime = new Date(filters.from).getTime()
    const sixHoursAgo = Date.now() - 6 * 3600_000
    expect(Math.abs(fromTime - sixHoursAgo)).toBeLessThan(120_000)
  })

  it('does not set from when hours is not provided', () => {
    renderHook(() => useTimelineData({ limit: 30, offset: 0 }))
    const filters = mockUseDecisions.mock.calls[0][0]
    expect(filters.from).toBeUndefined()
  })

  it('does not pass direction to useDecisions', () => {
    renderHook(() => useTimelineData({ direction: 'LONG', limit: 30, offset: 0 }))
    const filters = mockUseDecisions.mock.calls[0][0]
    expect(filters.direction).toBeUndefined()
  })

  it('returns data from useDecisions', () => {
    const mockData = {
      decisions: [{ id: '1', symbol: 'BTC/USDT' }],
      total: 1,
    }
    mockUseDecisions.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: undefined,
    })
    const { result } = renderHook(() => useTimelineData({ limit: 30, offset: 0 }))
    expect(result.current.data).toEqual(mockData)
  })
})
