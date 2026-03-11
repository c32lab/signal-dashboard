/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnomalyBadge from '../../../components/ui/AnomalyBadge'

describe('AnomalyBadge', () => {
  it('renders warning style with yellow border', () => {
    const { container } = render(<AnomalyBadge level="warning" message="No signals" />)
    expect(screen.getByText('No signals')).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
    const badge = container.querySelector('.border-yellow-500\\/60')
    expect(badge).toBeInTheDocument()
  })

  it('renders critical style with red border', () => {
    const { container } = render(<AnomalyBadge level="critical" message="Low accuracy" />)
    expect(screen.getByText('Low accuracy')).toBeInTheDocument()
    expect(screen.getByText('🔴')).toBeInTheDocument()
    const badge = container.querySelector('.border-red-500\\/60')
    expect(badge).toBeInTheDocument()
  })

  it('displays the message text', () => {
    render(<AnomalyBadge level="warning" message="Test alert message" />)
    expect(screen.getByText('Test alert message')).toBeInTheDocument()
  })
})
