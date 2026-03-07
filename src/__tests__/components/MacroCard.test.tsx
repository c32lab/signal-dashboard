/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MacroCard } from '../../components/predict/MacroCard'

describe('MacroCard', () => {
  it('renders label and value', () => {
    render(<MacroCard label="Fear & Greed" value="72" />)
    expect(screen.getByText('Fear & Greed')).toBeInTheDocument()
    expect(screen.getByText('72')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<MacroCard label="Score" value="85" sub="Above average" />)
    expect(screen.getByText('Above average')).toBeInTheDocument()
  })

  it('does not render sub element when not provided', () => {
    const { container } = render(<MacroCard label="Score" value="85" />)
    // Only two spans: label + value (no sub span)
    const spans = container.querySelectorAll('span')
    expect(spans).toHaveLength(2)
  })
})
