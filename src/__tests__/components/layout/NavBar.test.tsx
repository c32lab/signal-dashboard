/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NavBar from '../../../components/layout/NavBar'

function renderNavBar(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <NavBar />
    </MemoryRouter>
  )
}

describe('NavBar', () => {
  it('renders mobile title', () => {
    renderNavBar()
    expect(screen.getByText('Signal Dashboard')).toBeInTheDocument()
  })

  it('renders hamburger button with correct aria-label', () => {
    renderNavBar()
    expect(screen.getByRole('button', { name: 'Toggle navigation menu' })).toBeInTheDocument()
  })

  it('shows mobile menu when hamburger is clicked', () => {
    renderNavBar()
    const btn = screen.getByRole('button', { name: 'Toggle navigation menu' })
    fireEvent.click(btn)
    // MobileMenu renders nav links (some may duplicate desktop links)
    const items = screen.getAllByText('Overview')
    expect(items.length).toBeGreaterThanOrEqual(2) // desktop + mobile
  })

  it('hides mobile menu when hamburger is clicked again', () => {
    renderNavBar()
    const btn = screen.getByRole('button', { name: 'Toggle navigation menu' })
    fireEvent.click(btn) // open
    fireEvent.click(btn) // close
    // The MobileMenu should be removed; nav links from mobile menu should not be present
    // Desktop nav links may still exist, so we check for md:hidden container being gone
    const mobileMenuContainer = document.querySelector('.md\\:hidden.border-t')
    expect(mobileMenuContainer).toBeNull()
  })

  it('renders desktop nav links', () => {
    renderNavBar()
    // Desktop links are in hidden md:flex container
    const links = screen.getAllByText('Backtest')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })
})
