/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionSkeleton from '../../../components/ui/SectionSkeleton'

describe('SectionSkeleton', () => {
  it('renders with default text', () => {
    render(<SectionSkeleton />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders with custom label', () => {
    render(<SectionSkeleton label="alerts" />)
    expect(screen.getByText('Loading alerts…')).toBeInTheDocument()
  })

  it('applies animate-pulse class', () => {
    const { container } = render(<SectionSkeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('applies custom height class', () => {
    const { container } = render(<SectionSkeleton height="h-64" />)
    expect(container.firstChild).toHaveClass('h-64')
  })
})
