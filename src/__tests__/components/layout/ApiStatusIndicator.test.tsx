/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../../../hooks/useApi', () => ({
  useHealth: vi.fn(),
}))

import ApiStatusIndicator from '../../../components/layout/ApiStatusIndicator'
import { useHealth } from '../../../hooks/useApi'

const mockUseHealth = vi.mocked(useHealth)

describe('ApiStatusIndicator', () => {
  it('shows amber dot when loading', () => {
    mockUseHealth.mockReturnValue({ data: undefined, isLoading: true, error: undefined } as unknown as ReturnType<typeof useHealth>)
    render(<ApiStatusIndicator />)
    expect(screen.getByText('Connecting…')).toBeInTheDocument()
  })

  it('shows red dot on error', () => {
    mockUseHealth.mockReturnValue({ data: undefined, isLoading: false, error: new Error('fail') } as unknown as ReturnType<typeof useHealth>)
    render(<ApiStatusIndicator />)
    expect(screen.getByText('API Error')).toBeInTheDocument()
  })

  it('shows green dot when connected', () => {
    mockUseHealth.mockReturnValue({ data: { uptime_seconds: 100 }, isLoading: false, error: undefined } as unknown as ReturnType<typeof useHealth>)
    render(<ApiStatusIndicator />)
    expect(screen.getByText('API Connected')).toBeInTheDocument()
  })
})
