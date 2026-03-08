/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StabilityCountdown } from '../../../components/dashboard/StabilityCountdown'

const START = new Date('2026-03-08T22:17:00+08:00').getTime()
const DURATION = 72 * 60 * 60 * 1000
const TARGET = START + DURATION

describe('StabilityCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders title', () => {
    vi.setSystemTime(START + 10 * 60 * 60 * 1000) // 10h in
    render(<StabilityCountdown />)
    expect(screen.getByText('NT 72h Stability Test')).toBeInTheDocument()
  })

  it('shows elapsed and remaining time when running (<50%)', () => {
    vi.setSystemTime(START + 20 * 60 * 60 * 1000) // 20h in (~27.8%)
    render(<StabilityCountdown />)
    expect(screen.getByText('20h 0m / 72h')).toBeInTheDocument()
    expect(screen.getByText('52h 0m remaining')).toBeInTheDocument()
  })

  it('uses yellow color when progress < 50%', () => {
    vi.setSystemTime(START + 10 * 60 * 60 * 1000) // 10h in (~13.9%)
    const { container } = render(<StabilityCountdown />)
    const bar = container.querySelector('.bg-yellow-500')
    expect(bar).toBeInTheDocument()
  })

  it('uses green color when progress >= 50%', () => {
    vi.setSystemTime(START + 40 * 60 * 60 * 1000) // 40h in (~55.6%)
    const { container } = render(<StabilityCountdown />)
    const bar = container.querySelector('.bg-green-500')
    expect(bar).toBeInTheDocument()
  })

  it('shows passed state when completed', () => {
    vi.setSystemTime(TARGET + 60_000) // 1 min past target
    render(<StabilityCountdown />)
    expect(screen.getByText(/72h Stability Test PASSED/)).toBeInTheDocument()
  })

  it('shows start and target times', () => {
    vi.setSystemTime(START + 10 * 60 * 60 * 1000)
    render(<StabilityCountdown />)
    expect(screen.getByText('Started: 03-08 22:17 CST')).toBeInTheDocument()
    expect(screen.getByText('Target: 03-11 22:17 CST')).toBeInTheDocument()
  })

  it('shows percentage in progress bar area', () => {
    vi.setSystemTime(START + 36 * 60 * 60 * 1000) // 36h = 50%
    render(<StabilityCountdown />)
    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })
})
