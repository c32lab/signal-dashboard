/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TimelineFilterBar from '../../../components/timeline/TimelineFilterBar'

const defaultProps = {
  symbol: '',
  direction: '',
  hoursIdx: 2,
  total: 100,
  filteredCount: 50,
  symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  onSymbolChange: vi.fn(),
  onDirectionChange: vi.fn(),
  onHoursChange: vi.fn(),
}

describe('TimelineFilterBar', () => {
  it('renders symbol select with options', () => {
    render(<TimelineFilterBar {...defaultProps} />)
    // stripUsdt removes USDT suffix: BTC/USDT -> BTC/
    expect(screen.getByText('BTC/')).toBeInTheDocument()
    expect(screen.getByText('ETH/')).toBeInTheDocument()
  })

  it('renders direction select with all options', () => {
    render(<TimelineFilterBar {...defaultProps} />)
    // ALL appears both in direction select and time range button
    const allElements = screen.getAllByText('ALL')
    expect(allElements.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
    expect(screen.getByText('HOLD')).toBeInTheDocument()
  })

  it('renders time range buttons', () => {
    render(<TimelineFilterBar {...defaultProps} />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
    expect(screen.getByText('7d')).toBeInTheDocument()
  })

  it('highlights active time range button', () => {
    render(<TimelineFilterBar {...defaultProps} hoursIdx={1} />)
    const btn6h = screen.getByText('6h')
    expect(btn6h.className).toContain('bg-blue-600')
  })

  it('calls onHoursChange when time button clicked', () => {
    const onHoursChange = vi.fn()
    render(<TimelineFilterBar {...defaultProps} onHoursChange={onHoursChange} />)
    fireEvent.click(screen.getByText('1h'))
    expect(onHoursChange).toHaveBeenCalledWith(0)
  })

  it('calls onSymbolChange when symbol selected', () => {
    const onSymbolChange = vi.fn()
    render(<TimelineFilterBar {...defaultProps} onSymbolChange={onSymbolChange} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'BTC/USDT' } })
    expect(onSymbolChange).toHaveBeenCalledWith('BTC/USDT')
  })

  it('shows total count', () => {
    render(<TimelineFilterBar {...defaultProps} />)
    expect(screen.getByText(/100/)).toBeInTheDocument()
  })

  it('shows filtered count when direction is set', () => {
    render(<TimelineFilterBar {...defaultProps} direction="LONG" />)
    expect(screen.getByText(/50/)).toBeInTheDocument()
  })

  it('hides count when total is 0', () => {
    render(<TimelineFilterBar {...defaultProps} total={0} />)
    expect(screen.queryByText(/共/)).toBeNull()
  })
})
