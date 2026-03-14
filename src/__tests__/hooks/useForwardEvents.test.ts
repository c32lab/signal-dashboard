/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUseSWR = vi.fn()
vi.mock('swr', () => ({ default: mockUseSWR }))

const mockPredictApi = {
  forwardEvents: vi.fn(),
}
vi.mock('../../api/predict', () => ({ predictApi: mockPredictApi }))

const { useForwardEvents } = await import('../../hooks/useForwardEvents')

describe('useForwardEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })
    const result = useForwardEvents()
    expect(result.isLoading).toBe(true)
    expect(result.events).toEqual([])
    expect(result.error).toBeUndefined()
  })

  it('returns events from API response', () => {
    const events = [{ event_id: 'test-1', title: 'Test Event' }]
    mockUseSWR.mockReturnValue({ data: { events }, error: undefined, isLoading: false })
    const result = useForwardEvents()
    expect(result.events).toEqual(events)
    expect(result.isLoading).toBe(false)
  })

  it('returns error state', () => {
    const error = new Error('API error')
    mockUseSWR.mockReturnValue({ data: undefined, error, isLoading: false })
    const result = useForwardEvents()
    expect(result.error).toBe(error)
    expect(result.events).toEqual([])
  })

  it('passes correct SWR key and options', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true })
    useForwardEvents()
    expect(mockUseSWR).toHaveBeenCalledWith(
      'predict/forward-events',
      expect.any(Function),
      expect.objectContaining({ refreshInterval: 60_000, shouldRetryOnError: false }),
    )
  })
})
