/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../hooks/useApi', () => ({
  useOverview: vi.fn(),
}))

import KPIPanel from '../../components/KPIPanel'
import { useOverview } from '../../hooks/useApi'

const mockUseOverview = vi.mocked(useOverview)

function makeOverview() {
  return {
    total_decisions: 1500,
    recent_1h: { BTC: 5, ETH: 3 },
    action_distribution: { LONG: 700, SHORT: 500, HOLD: 300 },
    symbol_distribution: { 'BTC/USDT': 800, 'ETH/USDT': 500, 'SOL/USDT': 200 },
    type_distribution: { FAST: 900, SLOW: 600 },
  }
}

describe('KPIPanel', () => {
  it('renders loading state', () => {
    mockUseOverview.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useOverview>)
    render(<KPIPanel />)
    expect(screen.getByText('Loading overview…')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseOverview.mockReturnValue({ data: undefined, isLoading: false, error: new Error('Server down') } as unknown as ReturnType<typeof useOverview>)
    render(<KPIPanel />)
    expect(screen.getByText(/Failed to load overview/)).toBeInTheDocument()
    expect(screen.getByText(/Server down/)).toBeInTheDocument()
  })

  it('renders total decisions count', () => {
    mockUseOverview.mockReturnValue({ data: makeOverview(), isLoading: false, error: undefined } as unknown as ReturnType<typeof useOverview>)
    render(<KPIPanel />)
    expect(screen.getByText('1,500')).toBeInTheDocument()
    expect(screen.getByText('Total Decisions')).toBeInTheDocument()
  })

  it('renders direction distribution (LONG/SHORT/HOLD)', () => {
    mockUseOverview.mockReturnValue({ data: makeOverview(), isLoading: false, error: undefined } as unknown as ReturnType<typeof useOverview>)
    render(<KPIPanel />)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('HOLD')).toBeInTheDocument()
    expect(screen.getByText('700')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('By Direction')).toBeInTheDocument()
  })

  it('renders symbol distribution', () => {
    mockUseOverview.mockReturnValue({ data: makeOverview(), isLoading: false, error: undefined } as unknown as ReturnType<typeof useOverview>)
    render(<KPIPanel />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('SOL')).toBeInTheDocument()
    expect(screen.getByText('800')).toBeInTheDocument()
  })

  it('renders last 1h total', () => {
    mockUseOverview.mockReturnValue({ data: makeOverview(), isLoading: false, error: undefined } as unknown as ReturnType<typeof useOverview>)
    render(<KPIPanel />)
    expect(screen.getByText('8')).toBeInTheDocument() // 5 + 3
    expect(screen.getByText('Last 1h')).toBeInTheDocument()
  })
})
