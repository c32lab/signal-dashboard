/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DecisionMeta from '../../../components/history/DecisionMeta'

describe('DecisionMeta', () => {
  it('renders agree ratio', () => {
    render(<DecisionMeta agreeRatio={0.833} />)
    expect(screen.getByText('83.3%')).toBeInTheDocument()
    expect(screen.getByText('Agree ratio:')).toBeInTheDocument()
  })

  it('renders combined score with color', () => {
    const { rerender } = render(<DecisionMeta combinedScore={0.512} />)
    const positive = screen.getByText('0.512')
    expect(positive.className).toContain('text-green-400')

    rerender(<DecisionMeta combinedScore={-0.234} />)
    const negative = screen.getByText('-0.234')
    expect(negative.className).toContain('text-red-400')
  })

  it('renders decision type', () => {
    render(<DecisionMeta decisionType="FAST" />)
    expect(screen.getByText('FAST')).toBeInTheDocument()
  })

  it('renders reasoning', () => {
    render(<DecisionMeta reasoning="Market is bearish" />)
    expect(screen.getByText('Market is bearish')).toBeInTheDocument()
  })

  it('renders nothing when all props are null', () => {
    const { container } = render(<DecisionMeta />)
    expect(container.textContent).toBe('')
  })
})
