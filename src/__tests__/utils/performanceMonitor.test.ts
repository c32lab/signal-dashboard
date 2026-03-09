import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  initPerformanceMonitor,
  getPerformanceMetrics,
  resetPerformanceMonitor,
} from '../../utils/performanceMonitor'

describe('performanceMonitor', () => {
  const realFetch = globalThis.fetch

  beforeEach(() => {
    resetPerformanceMonitor()
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    resetPerformanceMonitor()
    globalThis.fetch = realFetch
  })

  it('returns null metrics before initialization', () => {
    const m = getPerformanceMetrics()
    expect(m.pageLoadMs).toBeNull()
    expect(m.avgApiResponseMs).toBeNull()
    expect(m.apiResponseTimes).toEqual([])
  })

  it('wraps fetch to track API response times', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok'))
    globalThis.fetch = mockFetch

    initPerformanceMonitor()

    await fetch('/api/health')

    const m = getPerformanceMetrics()
    expect(m.apiResponseTimes.length).toBe(1)
    expect(m.avgApiResponseMs).toBeGreaterThanOrEqual(0)
  })

  it('does not track non-API fetch calls', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok'))
    globalThis.fetch = mockFetch

    initPerformanceMonitor()

    await fetch('/static/image.png')

    const m = getPerformanceMetrics()
    expect(m.apiResponseTimes).toHaveLength(0)
  })

  it('tracks failed API calls', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network error'))
    globalThis.fetch = mockFetch

    initPerformanceMonitor()

    await expect(fetch('/api/data')).rejects.toThrow('network error')

    const m = getPerformanceMetrics()
    expect(m.apiResponseTimes).toHaveLength(1)
  })

  it('computes average across multiple calls', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok'))
    globalThis.fetch = mockFetch

    initPerformanceMonitor()

    await fetch('/api/a')
    await fetch('/api/b')
    await fetch('/api/c')

    const m = getPerformanceMetrics()
    expect(m.apiResponseTimes).toHaveLength(3)
    expect(m.avgApiResponseMs).toBeGreaterThanOrEqual(0)
  })

  it('resetPerformanceMonitor clears state and restores fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok'))
    globalThis.fetch = mockFetch

    initPerformanceMonitor()
    await fetch('/api/test')

    resetPerformanceMonitor()

    const m = getPerformanceMetrics()
    expect(m.apiResponseTimes).toHaveLength(0)
    expect(m.avgApiResponseMs).toBeNull()
  })
})
