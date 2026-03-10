/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from '../../../components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders default message', () => {
    render(<EmptyState />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<EmptyState message="No alerts data available" />)
    expect(screen.getByText('No alerts data available')).toBeInTheDocument()
  })

  it('renders custom icon', () => {
    render(<EmptyState icon="🔍" />)
    expect(screen.getByText('🔍')).toBeInTheDocument()
  })
})
