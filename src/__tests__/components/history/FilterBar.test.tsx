/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/useSymbols', () => ({
  useSymbols: () => ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
}))

import FilterBar from '../../../components/history/FilterBar'

const baseProps = {
  symbolFilter: '',
  actionFilter: '',
  typeFilter: '',
  directionFilter: '',
  timePeriod: '',
  typeOptions: ['FAST', 'SLOW'],
  exporting: false,
  total: 100,
  onSymbol: vi.fn(),
  onAction: vi.fn(),
  onType: vi.fn(),
  onDirection: vi.fn(),
  onTimePeriod: vi.fn(),
  onExport: vi.fn(),
}

describe('FilterBar', () => {
  it('renders filter selects', () => {
    render(<FilterBar {...baseProps} />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('All Symbols')).toBeInTheDocument()
    expect(screen.getByText('All Actions')).toBeInTheDocument()
    expect(screen.getByText('All Types')).toBeInTheDocument()
    expect(screen.getByText('All Directions')).toBeInTheDocument()
  })

  it('renders Export CSV button', () => {
    render(<FilterBar {...baseProps} />)
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('export button disabled when total=0', () => {
    render(<FilterBar {...baseProps} total={0} />)
    const btn = screen.getByText('Export CSV')
    expect(btn).toBeDisabled()
  })

  it('renders symbol options', () => {
    render(<FilterBar {...baseProps} />)
    // Symbols should appear as option text (stripped of /USDT)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    expect(screen.getByText('SOL')).toBeInTheDocument()
  })

  it('shows Exporting… text when exporting', () => {
    render(<FilterBar {...baseProps} exporting={true} />)
    expect(screen.getByText('Exporting…')).toBeInTheDocument()
  })

  it('renders time period options', () => {
    render(<FilterBar {...baseProps} />)
    expect(screen.getByText('All Time')).toBeInTheDocument()
    expect(screen.getByText('Last 1h')).toBeInTheDocument()
    expect(screen.getByText('Last 24h')).toBeInTheDocument()
  })
})
