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
    expect(screen.getByText('信号概览')).toBeInTheDocument()
    expect(screen.getByText('回测对比')).toBeInTheDocument()
    expect(screen.getByText('交易记录')).toBeInTheDocument()
  })

  it('renders group label button for advanced section', () => {
    renderMenu()
    expect(screen.getByText('高级分析')).toBeInTheDocument()
  })

  it('does not show group items initially', () => {
    renderMenu()
    expect(screen.queryByText('信号质量')).toBeNull()
  })

  it('expands group items on button click', () => {
    renderMenu()
    fireEvent.click(screen.getByText('高级分析'))
    expect(screen.getByText('信号质量')).toBeInTheDocument()
    expect(screen.getByText('系统健康')).toBeInTheDocument()
  })

  it('calls onClose when a top-level item is clicked', () => {
    const { onClose } = renderMenu()
    fireEvent.click(screen.getByText('回测对比'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when a group item is clicked', () => {
    const { onClose } = renderMenu()
    fireEvent.click(screen.getByText('高级分析'))
    fireEvent.click(screen.getByText('信号质量'))
    expect(onClose).toHaveBeenCalled()
  })
})
