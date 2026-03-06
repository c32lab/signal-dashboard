/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionSkeleton from '../../components/quality/SectionSkeleton'

describe('SectionSkeleton', () => {
  it('renders the loading text', () => {
    render(<SectionSkeleton text="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('has gray text styling class', () => {
    render(<SectionSkeleton text="loading" />)
    expect(screen.getByText('loading').closest('div')).toHaveClass('text-gray-500')
  })
})
