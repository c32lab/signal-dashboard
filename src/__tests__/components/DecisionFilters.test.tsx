/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DecisionFilters from '../../components/decision/DecisionFilters'

describe('DecisionFilters', () => {
  const baseProps = {
    timePreset: 'all' as const,
    onTimePreset: vi.fn(),
    symbolFilter: '',
    onSymbol: vi.fn(),
    directionFilter: '',
    onDirection: vi.fn(),
    symbols: ['BTC/USDT', 'ETH/USDT'],
  }

  it('renders heading', () => {
    render(<DecisionFilters {...baseProps} />)
    expect(screen.getByText('Decision History')).toBeInTheDocument()
  })

  it('renders all time preset buttons', () => {
    render(<DecisionFilters {...baseProps} />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
    expect(screen.getByText('7d')).toBeInTheDocument()
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('highlights active time preset', () => {
    render(<DecisionFilters {...baseProps} timePreset="6h" />)
    const btn = screen.getByText('6h')
    expect(btn.className).toContain('bg-blue-600')
  })

  it('calls onTimePreset when clicking a time button', () => {
    const onTimePreset = vi.fn()
    render(<DecisionFilters {...baseProps} onTimePreset={onTimePreset} />)
    fireEvent.click(screen.getByText('1h'))
    expect(onTimePreset).toHaveBeenCalledWith('1h')
  })

  it('renders symbol options with /USDT stripped', () => {
    render(<DecisionFilters {...baseProps} />)
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('calls onSymbol when symbol select changes', () => {
    const onSymbol = vi.fn()
    render(<DecisionFilters {...baseProps} onSymbol={onSymbol} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'BTC/USDT' } })
    expect(onSymbol).toHaveBeenCalledWith('BTC/USDT')
  })

  it('renders direction options', () => {
    render(<DecisionFilters {...baseProps} />)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('HOLD')).toBeInTheDocument()
  })

  it('calls onDirection when direction select changes', () => {
    const onDirection = vi.fn()
    render(<DecisionFilters {...baseProps} onDirection={onDirection} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: 'LONG' } })
    expect(onDirection).toHaveBeenCalledWith('LONG')
  })
})
