/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DeltaBadge from '../../../components/ui/DeltaBadge'

describe('DeltaBadge', () => {
  it('renders positive delta with up arrow', () => {
    render(<DeltaBadge current={60} previous={50} format="percent" />)
    expect(screen.getByText(/▲/)).toBeInTheDocument()
    expect(screen.getByText(/\+10\.0pp/)).toBeInTheDocument()
  })

  it('renders negative delta with down arrow', () => {
    render(<DeltaBadge current={45} previous={50} format="percent" />)
    expect(screen.getByText(/▼/)).toBeInTheDocument()
  })

  it('renders neutral when current equals previous', () => {
    render(<DeltaBadge current={50} previous={50} format="percent" />)
    expect(screen.getByText(/→ 0pp/)).toBeInTheDocument()
  })

  it('renders neutral when both are zero', () => {
    render(<DeltaBadge current={0} previous={0} format="percent" />)
    expect(screen.getByText(/→ 0%/)).toBeInTheDocument()
  })

  it('handles previous=0 with non-zero current', () => {
    render(<DeltaBadge current={10} previous={0} format="number" />)
    expect(screen.getByText(/▲/)).toBeInTheDocument()
  })

  it('shows pulsing dot for large changes (>15%)', () => {
    const { container } = render(<DeltaBadge current={80} previous={50} format="percent" />)
    const pulsingDot = container.querySelector('.animate-pulse')
    expect(pulsingDot).toBeInTheDocument()
  })

  it('does not show pulsing dot for small changes', () => {
    const { container } = render(<DeltaBadge current={51} previous={50} format="percent" />)
    const pulsingDot = container.querySelector('.animate-pulse')
    expect(pulsingDot).not.toBeInTheDocument()
  })

  it('inverts colors when invertColor is true', () => {
    const { container } = render(<DeltaBadge current={60} previous={50} format="percent" invertColor />)
    const span = container.querySelector('span.text-red-400')
    expect(span).toBeInTheDocument()
  })

  it('formats number type with percentage suffix', () => {
    render(<DeltaBadge current={150} previous={100} format="number" />)
    expect(screen.getByText(/50\.0%/)).toBeInTheDocument()
  })
})
