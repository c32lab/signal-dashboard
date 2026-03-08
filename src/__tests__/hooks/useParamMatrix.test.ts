/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUseSWR = vi.fn().mockReturnValue({ data: undefined, error: undefined, isLoading: true })
vi.mock('swr', () => ({ default: mockUseSWR }))

const { useParamMatrix, useWalkForward } = await import('../../hooks/useParamMatrix')

describe('useParamMatrix hooks', () => {
  beforeEach(() => {
    mockUseSWR.mockClear()
  })

  it('useParamMatrix passes correct SWR key with 60s refresh', () => {
    useParamMatrix()
    expect(mockUseSWR).toHaveBeenCalledWith(
      'backtest/parameter-matrix',
      expect.any(Function),
      { refreshInterval: 60_000 },
    )
  })

  it('useWalkForward passes correct SWR key with 60s refresh', () => {
    useWalkForward()
    expect(mockUseSWR).toHaveBeenCalledWith(
      'backtest/walk-forward',
      expect.any(Function),
      { refreshInterval: 60_000 },
    )
  })
})
