/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReasoningText from '../../components/timeline/ReasoningText'

describe('ReasoningText', () => {
  it('renders short text without expand button', () => {
    render(<ReasoningText text="Short text" />)
    expect(screen.getByText('Short text')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders long text with expand button', () => {
    const longText = 'A'.repeat(150)
    render(<ReasoningText text={longText} />)
    expect(screen.getByText(longText)).toBeInTheDocument()
    expect(screen.getByText('展开')).toBeInTheDocument()
  })

  it('applies line-clamp-2 to long text when collapsed', () => {
    const longText = 'B'.repeat(150)
    render(<ReasoningText text={longText} />)
    const paragraph = screen.getByText(longText)
    expect(paragraph.className).toContain('line-clamp-2')
  })

  it('toggles expand/collapse on button click', () => {
    const longText = 'C'.repeat(150)
    render(<ReasoningText text={longText} />)

    const btn = screen.getByText('展开')
    fireEvent.click(btn)
    expect(screen.getByText('收起')).toBeInTheDocument()
    expect(screen.getByText(longText).className).not.toContain('line-clamp-2')

    fireEvent.click(screen.getByText('收起'))
    expect(screen.getByText('展开')).toBeInTheDocument()
    expect(screen.getByText(longText).className).toContain('line-clamp-2')
  })

  it('treats text with exactly 120 chars as short', () => {
    const text = 'D'.repeat(120)
    render(<ReasoningText text={text} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
