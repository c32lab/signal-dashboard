/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DecisionFilters from '../../../components/decision/DecisionFilters'
import { TIME_PRESETS, DIRECTIONS } from '../../../components/decision/decisionHelpers'
import type { TimePreset } from '../../../components/decision/decisionHelpers'

const defaultProps = {
  timePreset: '24h' as TimePreset,
  onTimePreset: vi.fn(),
  symbolFilter: '',
  onSymbol: vi.fn(),
  directionFilter: '',
  onDirection: vi.fn(),
  symbols: ['BTC/USDT', 'ETH/USDT'],
}

describe('DecisionFilters', () => {
  it('renders the heading', () => {
    render(<DecisionFilters {...defaultProps} />)
    expect(screen.getByText('Decision History')).toBeInTheDocument()
  })

  it('renders all time preset buttons', () => {
    render(<DecisionFilters {...defaultProps} />)
    for (const p of TIME_PRESETS) {
      expect(screen.getByText(p.label)).toBeInTheDocument()
    }
  })

  it('highlights the active time preset', () => {
    render(<DecisionFilters {...defaultProps} timePreset="1h" />)
    const btn = screen.getByText('1h')
    expect(btn.className).toContain('bg-blue-600')
  })

  it('calls onTimePreset when a preset button is clicked', () => {
    const onTimePreset = vi.fn()
    render(<DecisionFilters {...defaultProps} onTimePreset={onTimePreset} />)
    fireEvent.click(screen.getByText('7d'))
    expect(onTimePreset).toHaveBeenCalledWith('7d')
  })

  it('renders symbol options with USDT stripped from display', () => {
    render(<DecisionFilters {...defaultProps} />)
    expect(screen.getByText('All symbols')).toBeInTheDocument()
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('calls onSymbol when symbol select changes', () => {
    const onSymbol = vi.fn()
    render(<DecisionFilters {...defaultProps} onSymbol={onSymbol} />)
    const select = screen.getByDisplayValue('All symbols')
    fireEvent.change(select, { target: { value: 'BTC/USDT' } })
    expect(onSymbol).toHaveBeenCalledWith('BTC/USDT')
  })

  it('renders direction options', () => {
    render(<DecisionFilters {...defaultProps} />)
    expect(screen.getByText('All directions')).toBeInTheDocument()
    for (const d of DIRECTIONS) {
      expect(screen.getByRole('option', { name: d })).toBeInTheDocument()
    }
  })

  it('calls onDirection when direction select changes', () => {
    const onDirection = vi.fn()
    render(<DecisionFilters {...defaultProps} onDirection={onDirection} />)
    const select = screen.getByDisplayValue('All directions')
    fireEvent.change(select, { target: { value: 'LONG' } })
    expect(onDirection).toHaveBeenCalledWith('LONG')
  })

  it('renders with empty symbols array', () => {
    render(<DecisionFilters {...defaultProps} symbols={[]} />)
    const options = screen.getByDisplayValue('All symbols').querySelectorAll('option')
    expect(options).toHaveLength(1) // only "All symbols"
  })
})
