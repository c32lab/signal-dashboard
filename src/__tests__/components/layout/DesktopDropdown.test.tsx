/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DesktopDropdown from '../../../components/layout/DesktopDropdown'
import type { NavGroup } from '../../../components/layout/navTypes'

const group: NavGroup = {
  label: 'Advanced',
  items: [
    { to: '/quality', label: 'Quality' },
    { to: '/advanced/system', label: 'System Health' },
  ],
}

function renderDropdown(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <DesktopDropdown group={group} />
    </MemoryRouter>
  )
}

describe('DesktopDropdown', () => {
  it('renders group label button', () => {
    renderDropdown()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('does not show dropdown items initially', () => {
    renderDropdown()
    expect(screen.queryByText('Quality')).toBeNull()
  })

  it('shows dropdown items on click', () => {
    renderDropdown()
    fireEvent.click(screen.getByText('Advanced'))
    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('System Health')).toBeInTheDocument()
  })

  it('hides dropdown on second click', () => {
    renderDropdown()
    fireEvent.click(screen.getByText('Advanced'))
    fireEvent.click(screen.getByText('Advanced'))
    expect(screen.queryByText('Quality')).toBeNull()
  })

  it('closes dropdown when clicking an item', () => {
    renderDropdown()
    fireEvent.click(screen.getByText('Advanced'))
    fireEvent.click(screen.getByText('Quality'))
    expect(screen.queryByText('System Health')).toBeNull()
  })

  it('highlights button when child route is active', () => {
    renderDropdown('/quality')
    const button = screen.getByText('Advanced')
    expect(button.className).toContain('text-blue-400')
  })

  it('does not highlight button when no child route is active', () => {
    renderDropdown('/')
    const button = screen.getByText('Advanced')
    expect(button.className).toContain('text-gray-400')
  })

  it('closes dropdown on outside mousedown', () => {
    renderDropdown()
    fireEvent.click(screen.getByText('Advanced'))
    expect(screen.getByText('Quality')).toBeInTheDocument()
    fireEvent.mouseDown(document.body)
    expect(screen.queryByText('Quality')).toBeNull()
  })
})
