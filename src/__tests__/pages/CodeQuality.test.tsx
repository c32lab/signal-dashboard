/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CodeQuality from '../../pages/CodeQuality'

describe('CodeQuality', () => {
  it('renders page title', () => {
    render(<CodeQuality />)
    expect(screen.getByText('Code Quality')).toBeInTheDocument()
  })

  it('renders placeholder message', () => {
    render(<CodeQuality />)
    expect(screen.getByText(/Code Quality 数据对接中/)).toBeInTheDocument()
  })

  it('renders gear icon', () => {
    render(<CodeQuality />)
    expect(screen.getByText('🔧')).toBeInTheDocument()
  })
})
