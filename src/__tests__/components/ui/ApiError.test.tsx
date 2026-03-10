/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiError from '../../../components/ui/ApiError'

describe('ApiError', () => {
  it('renders default error message', () => {
    render(<ApiError />)
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })

  it('renders custom error message', () => {
    render(<ApiError message="Network error" />)
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    render(<ApiError onRetry={() => {}} />)
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ApiError />)
    expect(screen.queryByText('Retry')).not.toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    render(<ApiError onRetry={onRetry} />)
    fireEvent.click(screen.getByText('Retry'))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
