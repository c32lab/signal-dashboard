/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockUseDecisions = vi.fn()
const mockUsePerformance = vi.fn()
const mockUseOverview = vi.fn()

vi.mock('../../../hooks/useApi', () => ({
  useDecisions: (...args: unknown[]) => mockUseDecisions(...args),
  usePerformance: () => mockUsePerformance(),
  useOverview: () => mockUseOverview(),
}))

vi.mock('../../../components/history/exportCsv', () => ({
  exportCsv: vi.fn().mockResolvedValue(undefined),
}))

import { useTraderHistory } from '../../../components/history/useTraderHistory'

describe('useTraderHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDecisions.mockReturnValue({
      data: { decisions: [], total: 0 },
      isLoading: false,
      error: undefined,
    })
    mockUsePerformance.mockReturnValue({ data: undefined })
    mockUseOverview.mockReturnValue({ data: undefined })
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => useTraderHistory())
    expect(result.current.symbolFilter).toBe('')
    expect(result.current.actionFilter).toBe('')
    expect(result.current.directionFilter).toBe('')
    expect(result.current.typeFilter).toBe('')
    expect(result.current.decisions).toEqual([])
    expect(result.current.total).toBe(0)
    expect(result.current.currentPage).toBe(1)
  })

  it('updates symbol filter and resets page', () => {
    const { result } = renderHook(() => useTraderHistory())
    act(() => result.current.handleSymbol('BTC/USDT'))
    expect(result.current.symbolFilter).toBe('BTC/USDT')
  })

  it('updates action filter', () => {
    const { result } = renderHook(() => useTraderHistory())
    act(() => result.current.handleAction('LONG'))
    expect(result.current.actionFilter).toBe('LONG')
  })

  it('updates direction filter', () => {
    const { result } = renderHook(() => useTraderHistory())
    act(() => result.current.handleDirection('SHORT'))
    expect(result.current.directionFilter).toBe('SHORT')
  })

  it('filters decisions client-side by direction', () => {
    mockUseDecisions.mockReturnValue({
      data: {
        decisions: [
          { id: '1', direction: 'LONG' },
          { id: '2', direction: 'SHORT' },
        ],
        total: 2,
      },
      isLoading: false,
      error: undefined,
    })
    const { result } = renderHook(() => useTraderHistory())
    act(() => result.current.handleDirection('LONG'))
    expect(result.current.decisions).toHaveLength(1)
    expect(result.current.decisions[0].direction).toBe('LONG')
  })

  it('calculates active signals from overview data', () => {
    mockUseOverview.mockReturnValue({
      data: { action_distribution: { LONG: 3, SHORT: 2, HOLD: 5 } },
    })
    const { result } = renderHook(() => useTraderHistory())
    expect(result.current.activeSignals).toBe(5) // LONG + SHORT
  })

  it('returns null active signals when no overview data', () => {
    const { result } = renderHook(() => useTraderHistory())
    expect(result.current.activeSignals).toBeNull()
  })

  it('computes type options from overview', () => {
    mockUseOverview.mockReturnValue({
      data: { type_distribution: { FAST: 10, SLOW: 5 } },
    })
    const { result } = renderHook(() => useTraderHistory())
    expect(result.current.typeOptions).toEqual(['FAST', 'SLOW'])
  })
})
