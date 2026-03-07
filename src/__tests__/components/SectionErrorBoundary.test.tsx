/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SectionErrorBoundary from '../../components/SectionErrorBoundary'

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error')
  return <div>OK</div>
}

describe('SectionErrorBoundary', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('renders children when no error', () => {
    render(
      <SectionErrorBoundary>
        <div>Child content</div>
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('catches error and shows fallback UI with error message', () => {
    render(
      <SectionErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Failed to render')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('shows title in error message when provided', () => {
    render(
      <SectionErrorBoundary title="My Section">
        <ThrowError shouldThrow={true} />
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Failed to render My Section')).toBeInTheDocument()
  })

  it('"Retry" button resets the error state and re-renders children', () => {
    const { rerender } = render(
      <SectionErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SectionErrorBoundary>
    )
    expect(screen.getByText('Failed to render')).toBeInTheDocument()

    // Re-render with non-throwing child, then click Retry
    rerender(
      <SectionErrorBoundary>
        <ThrowError shouldThrow={false} />
      </SectionErrorBoundary>
    )
    fireEvent.click(screen.getByText('Retry'))
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('"Show trace" / "Hide trace" toggle works', () => {
    render(
      <SectionErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SectionErrorBoundary>
    )
    // Initially trace is hidden
    expect(screen.getByText(/Show trace/)).toBeInTheDocument()
    expect(screen.queryByText(/Hide trace/)).not.toBeInTheDocument()

    // Click to show trace
    fireEvent.click(screen.getByText(/Show trace/))
    expect(screen.getByText(/Hide trace/)).toBeInTheDocument()

    // Click to hide trace again
    fireEvent.click(screen.getByText(/Hide trace/))
    expect(screen.getByText(/Show trace/)).toBeInTheDocument()
  })
})
