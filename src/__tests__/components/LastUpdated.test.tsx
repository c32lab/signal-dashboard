/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LastUpdated from '../../components/LastUpdated'

describe('LastUpdated', () => {
  it('renders nothing when dataVersion is undefined', () => {
    const { container } = render(<LastUpdated />)
    expect(container.innerHTML).toBe('')
  })

  it('renders green dot and "Live" text when dataVersion is provided', () => {
    render(<LastUpdated dataVersion="v1" />)
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders with any truthy dataVersion (number)', () => {
    render(<LastUpdated dataVersion={42} />)
    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('renders with any truthy dataVersion (object)', () => {
    render(<LastUpdated dataVersion={{ ts: 1 }} />)
    expect(screen.getByText('Live')).toBeInTheDocument()
  })
})
