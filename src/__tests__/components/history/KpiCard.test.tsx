/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import KpiCard from '../../../components/history/KpiCard'

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value="1,234" />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('applies custom color class', () => {
    render(<KpiCard label="PnL" value="+5.2%" color="text-green-400" />)
    const el = screen.getByText('+5.2%')
    expect(el.className).toContain('text-green-400')
  })

  it('uses default color when not specified', () => {
    render(<KpiCard label="Score" value="42" />)
    const el = screen.getByText('42')
    expect(el.className).toContain('text-gray-100')
  })

  it('renders with monospace font', () => {
    render(<KpiCard label="Value" value="99" />)
    const el = screen.getByText('99')
    expect(el.className).toContain('font-mono')
  })

  it('renders DeltaBadge when delta prop is provided', () => {
    render(<KpiCard label="Win Rate" value="60%" delta={{ current: 60, previous: 50, format: 'percent' }} />)
    expect(screen.getByText('Win Rate')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
    // DeltaBadge should render with the delta info (arrow + value)
    expect(screen.getByText(/\+10\.0pp/)).toBeInTheDocument()
  })

  it('renders AnomalyBadge when anomaly prop is provided', () => {
    render(<KpiCard label="Win Rate" value="45%" anomaly={{ level: 'critical', message: 'Win rate below 50%' }} />)
    expect(screen.getByText('Win rate below 50%')).toBeInTheDocument()
  })

  it('renders both delta and anomaly when both provided', () => {
    render(
      <KpiCard
        label="Win Rate"
        value="45%"
        delta={{ current: 45, previous: 55, format: 'percent' }}
        anomaly={{ level: 'critical', message: 'Win rate below 50%' }}
      />
    )
    expect(screen.getByText(/\-10\.0pp/)).toBeInTheDocument()
    expect(screen.getByText('Win rate below 50%')).toBeInTheDocument()
  })

  it('renders warning anomaly badge', () => {
    render(<KpiCard label="Active Signals" value="0" anomaly={{ level: 'warning', message: 'No active signals' }} />)
    expect(screen.getByText('No active signals')).toBeInTheDocument()
  })

  it('does not render delta or anomaly when props are not provided', () => {
    const { container } = render(<KpiCard label="Total" value="100" />)
    expect(container.querySelectorAll('.mt-1')).toHaveLength(0)
  })
})
