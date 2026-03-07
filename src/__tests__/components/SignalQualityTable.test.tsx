/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SignalQualityTable from '../../components/quality/SignalQualityTable'
import type { SignalQualitySymbol } from '../../types'

const mockData: SignalQualitySymbol[] = [
  { symbol: 'BTC/USDT', long: 10, short: 5, hold: 3 },
  { symbol: 'ETH/USDT', long: 8, short: 4, hold: 6 },
]

describe('SignalQualityTable', () => {
  it('renders "Signal Quality" heading', () => {
    render(<SignalQualityTable data={[]} hours={1} onHoursChange={() => {}} />)
    expect(screen.getByText('Signal Quality')).toBeInTheDocument()
  })

  it('renders time buttons (1h, 6h, 24h) with active state highlighting', () => {
    render(<SignalQualityTable data={[]} hours={6} onHoursChange={() => {}} />)
    const btn1 = screen.getByText('1h')
    const btn6 = screen.getByText('6h')
    const btn24 = screen.getByText('24h')
    expect(btn1).toBeInTheDocument()
    expect(btn6).toBeInTheDocument()
    expect(btn24).toBeInTheDocument()
    // Active button has bg-blue-600
    expect(btn6.className).toContain('bg-blue-600')
    expect(btn1.className).not.toContain('bg-blue-600')
    expect(btn24.className).not.toContain('bg-blue-600')
  })

  it('calls onHoursChange when a time button is clicked', () => {
    const onChange = vi.fn()
    render(<SignalQualityTable data={[]} hours={1} onHoursChange={onChange} />)
    fireEvent.click(screen.getByText('24h'))
    expect(onChange).toHaveBeenCalledWith(24)
  })

  it('renders table rows with symbol, long, short, hold, total, actionable rate', () => {
    render(<SignalQualityTable data={mockData} hours={1} onHoursChange={() => {}} />)
    // Symbol stripped of /USDT
    expect(screen.getByText('BTC')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
    // Long values
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    // Short values
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    // Hold values
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    // Total: 18 and 18
    const totals = screen.getAllByText('18')
    expect(totals.length).toBe(2)
  })

  it('calculates actionable rate correctly: (long + short) / total * 100', () => {
    render(<SignalQualityTable data={mockData} hours={1} onHoursChange={() => {}} />)
    // BTC: (10+5)/18 * 100 = 83.3%
    expect(screen.getByText('83.3%')).toBeInTheDocument()
    // ETH: (8+4)/18 * 100 = 66.7%
    expect(screen.getByText('66.7%')).toBeInTheDocument()
  })

  it('shows "No data" when data array is empty', () => {
    render(<SignalQualityTable data={[]} hours={1} onHoursChange={() => {}} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('strips "/USDT" from symbol display', () => {
    render(
      <SignalQualityTable
        data={[{ symbol: 'SOL/USDT', long: 1, short: 2, hold: 3 }]}
        hours={1}
        onHoursChange={() => {}}
      />
    )
    expect(screen.getByText('SOL')).toBeInTheDocument()
    expect(screen.queryByText('SOL/USDT')).not.toBeInTheDocument()
  })
})
