/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BridgeStatusDot from '../../../components/forecast/BridgeStatusDot'

describe('BridgeStatusDot', () => {
  it('renders a green dot for connected status', () => {
    render(<BridgeStatusDot status="connected" lastSync="2026-03-10T09:00:00Z" />)
    const dot = document.querySelector('.bg-green-500')
    expect(dot).toBeInTheDocument()
  })

  it('renders a yellow dot for degraded status', () => {
    render(<BridgeStatusDot status="degraded" lastSync="2026-03-10T09:00:00Z" />)
    const dot = document.querySelector('.bg-yellow-500')
    expect(dot).toBeInTheDocument()
  })

  it('renders a red dot for disconnected status', () => {
    render(<BridgeStatusDot status="disconnected" lastSync="2026-03-10T09:00:00Z" />)
    const dot = document.querySelector('.bg-red-500')
    expect(dot).toBeInTheDocument()
  })

  it('shows tooltip with status and last sync', () => {
    render(<BridgeStatusDot status="connected" lastSync="2026-03-10T09:00:00Z" />)
    const wrapper = screen.getByTitle(/Connected/)
    expect(wrapper).toBeInTheDocument()
    expect(wrapper.getAttribute('title')).toContain('Last sync')
  })
})
