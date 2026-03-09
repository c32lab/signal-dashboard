/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AccuracyResponse } from '../../../types'

function makeData(pct24h: number, pct12h: number): AccuracyResponse {
  const win = (pct: number) => ({
    total_actionable: 10,
    accuracy: { '1h_pct': 50, '4h_pct': pct },
    by_symbol: {},
    dampened_symbols: [] as string[],
  })
  return {
    timestamp: '2026-03-08T12:00:00Z',
    windows: { '6h': win(50), '12h': win(pct12h), '24h': win(pct24h) },
  }
}

const mockUseAccuracy = vi.fn(() => ({
  data: makeData(60, 55) as AccuracyResponse | undefined,
  isLoading: false,
  error: undefined,
}))

vi.mock('../../../hooks/useApi', () => ({
  useAccuracy: () => mockUseAccuracy(),
}))

import AccuracyAlertIndicator from '../../../components/quality/AccuracyAlertIndicator'

describe('AccuracyAlertIndicator', () => {
  beforeEach(() => {
    mockUseAccuracy.mockReturnValue({ data: makeData(60, 55), isLoading: false, error: undefined })
  })

  it('shows green badge when accuracy >= 55%', () => {
    render(<AccuracyAlertIndicator />)
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('60.0%')).toBeInTheDocument()
  })

  it('shows yellow badge when accuracy 45-55%', () => {
    mockUseAccuracy.mockReturnValue({ data: makeData(50, 50), isLoading: false, error: undefined })
    render(<AccuracyAlertIndicator />)
    expect(screen.getByText('Caution')).toBeInTheDocument()
  })

  it('shows red badge when accuracy < 45%', () => {
    mockUseAccuracy.mockReturnValue({ data: makeData(40, 45), isLoading: false, error: undefined })
    render(<AccuracyAlertIndicator />)
    expect(screen.getByText('Alert')).toBeInTheDocument()
  })

  it('shows delta arrow when accuracy differs between windows', () => {
    mockUseAccuracy.mockReturnValue({ data: makeData(60, 50), isLoading: false, error: undefined })
    render(<AccuracyAlertIndicator />)
    expect(screen.getByTestId('delta-indicator')).toHaveTextContent('▲')
  })

  it('shows down arrow when accuracy dropped', () => {
    mockUseAccuracy.mockReturnValue({ data: makeData(40, 55), isLoading: false, error: undefined })
    render(<AccuracyAlertIndicator />)
    expect(screen.getByTestId('delta-indicator')).toHaveTextContent('▼')
  })

  it('renders nothing when loading', () => {
    mockUseAccuracy.mockReturnValue({ data: undefined, isLoading: true, error: undefined })
    const { container } = render(<AccuracyAlertIndicator />)
    expect(container.firstChild).toBeNull()
  })
})
