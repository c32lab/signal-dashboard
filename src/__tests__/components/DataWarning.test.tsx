/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DataWarning from '../../components/DataWarning'

describe('DataWarning', () => {
  it('renders warning icon', () => {
    render(<DataWarning message="test warning" />)
    expect(screen.getByText('⚠')).toBeInTheDocument()
  })

  it('has aria-label with the message', () => {
    render(<DataWarning message="check this" />)
    expect(screen.getByLabelText('check this')).toBeInTheDocument()
  })

  it('shows tooltip on hover and hides on mouseLeave', () => {
    render(<DataWarning message="hover message" />)
    const icon = screen.getByText('⚠')

    // tooltip not visible initially
    expect(screen.queryByText('hover message')).not.toBeInTheDocument()

    // show on mouseEnter
    fireEvent.mouseEnter(icon)
    expect(screen.getByText('hover message')).toBeInTheDocument()

    // hide on mouseLeave
    fireEvent.mouseLeave(icon)
    expect(screen.queryByText('hover message')).not.toBeInTheDocument()
  })
})
