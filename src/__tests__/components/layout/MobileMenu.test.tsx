/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MobileMenu from '../../../components/layout/MobileMenu'

function renderMenu(onClose = vi.fn()) {
  return {
    onClose,
    ...render(
      <MemoryRouter>
        <MobileMenu onClose={onClose} />
      </MemoryRouter>
    ),
  }
}

describe('MobileMenu', () => {
  it('renders top-level nav items', () => {
    renderMenu()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Backtest')).toBeInTheDocument()
    expect(screen.getByText('Trading')).toBeInTheDocument()
  })

  it('renders group label button for advanced section', () => {
    renderMenu()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('does not show group items initially', () => {
    renderMenu()
    expect(screen.queryByText('Quality')).toBeNull()
  })

  it('expands group items on button click', () => {
    renderMenu()
    fireEvent.click(screen.getByText('Advanced'))
    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('System Health')).toBeInTheDocument()
  })

  it('calls onClose when a top-level item is clicked', () => {
    const { onClose } = renderMenu()
    fireEvent.click(screen.getByText('Backtest'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when a group item is clicked', () => {
    const { onClose } = renderMenu()
    fireEvent.click(screen.getByText('Advanced'))
    fireEvent.click(screen.getByText('Quality'))
    expect(onClose).toHaveBeenCalled()
  })
})
