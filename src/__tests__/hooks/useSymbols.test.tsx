/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

// Mock useHealth from useApi
const mockUseHealth = vi.fn()
vi.mock('../../hooks/useApi', () => ({
  useHealth: () => mockUseHealth(),
}))

const { SymbolsProvider, useSymbols } = await import('../../hooks/useSymbols')

function wrapper({ children }: { children: ReactNode }) {
  return <SymbolsProvider>{children}</SymbolsProvider>
}

describe('useSymbols', () => {
  it('returns active_symbols from health data', () => {
    mockUseHealth.mockReturnValue({ data: { active_symbols: ['SOL/USDT', 'BTC/USDT'] } })
    const { result } = renderHook(() => useSymbols(), { wrapper })
    expect(result.current).toEqual(['SOL/USDT', 'BTC/USDT'])
  })

  it('returns fallback symbols when health data is undefined', () => {
    mockUseHealth.mockReturnValue({ data: undefined })
    const { result } = renderHook(() => useSymbols(), { wrapper })
    expect(result.current).toEqual(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'])
  })

  it('returns fallback symbols when active_symbols is undefined', () => {
    mockUseHealth.mockReturnValue({ data: { status: 'ok' } })
    const { result } = renderHook(() => useSymbols(), { wrapper })
    expect(result.current).toEqual(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'])
  })

  it('returns empty context default when used without provider', () => {
    mockUseHealth.mockReturnValue({ data: undefined })
    const { result } = renderHook(() => useSymbols())
    // Without provider, context default is []
    expect(result.current).toEqual([])
  })
})
