/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionError from '../../components/quality/SectionError'

describe('SectionError', () => {
  it('renders the error message text', () => {
    render(<SectionError message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has red text styling class', () => {
    render(<SectionError message="error" />)
    expect(screen.getByText('error').closest('div')).toHaveClass('text-red-400')
  })
})
