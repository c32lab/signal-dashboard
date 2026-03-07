/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CollectorStatus } from '../../components/dashboard/CollectorStatus'
import type { CollectorHealthResponse } from '../../types'

const mockData: CollectorHealthResponse = {
  collectors: [
    { name: 'binance', is_disabled: false, is_degraded: false, error_count: 0, disabled_remaining_secs: 0 },
    { name: 'coinglass', is_disabled: false, is_degraded: true, error_count: 3, disabled_remaining_secs: 0 },
    { name: 'lunarcrush', is_disabled: true, is_degraded: false, error_count: 1, disabled_remaining_secs: 300 },
  ],
}

describe('CollectorStatus', () => {
  it('renders all collector names', () => {
    render(<CollectorStatus data={mockData} />)
    expect(screen.getByText('binance')).toBeInTheDocument()
    expect(screen.getByText('coinglass')).toBeInTheDocument()
    expect(screen.getByText('lunarcrush')).toBeInTheDocument()
  })

  it('healthy collector shows green styling', () => {
    render(<CollectorStatus data={mockData} />)
    const pill = screen.getByText('binance').closest('span')!
    expect(pill.className).toContain('bg-green-900')
    expect(pill.className).toContain('text-green-400')
  })

  it('degraded collector shows yellow styling', () => {
    render(<CollectorStatus data={mockData} />)
    const pill = screen.getByText('coinglass').closest('span')!
    expect(pill.className).toContain('bg-yellow-900')
    expect(pill.className).toContain('text-yellow-300')
  })

  it('disabled collector shows red styling', () => {
    render(<CollectorStatus data={mockData} />)
    const pill = screen.getByText('lunarcrush').closest('span')!
    expect(pill.className).toContain('bg-red-900')
    expect(pill.className).toContain('text-red-300')
  })

  it('shows error count when > 0', () => {
    render(<CollectorStatus data={mockData} />)
    expect(screen.getByText('(3 err)')).toBeInTheDocument()
    expect(screen.getByText('(1 err)')).toBeInTheDocument()
  })

  it('hides error count when 0', () => {
    render(<CollectorStatus data={mockData} />)
    expect(screen.queryByText('(0 err)')).not.toBeInTheDocument()
  })
})
