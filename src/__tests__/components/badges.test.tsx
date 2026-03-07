/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DirectionBadge, StatusBadge } from '../../components/predict/badges'

describe('DirectionBadge', () => {
  it('renders "LONG" with green styling', () => {
    render(<DirectionBadge direction="LONG" />)
    const el = screen.getByText('LONG')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('bg-green-900')
    expect(el.className).toContain('text-green-300')
  })

  it('renders "SHORT" with red styling', () => {
    render(<DirectionBadge direction="SHORT" />)
    const el = screen.getByText('SHORT')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('bg-red-900')
    expect(el.className).toContain('text-red-300')
  })

  it('handles case-insensitive direction', () => {
    render(<DirectionBadge direction="long" />)
    const el = screen.getByText('long')
    expect(el).toBeInTheDocument()
    expect(el.className).toContain('bg-green-900')
  })
})

describe('StatusBadge', () => {
  const cases: { status: string; label: string; tip: string }[] = [
    { status: 'active', label: '🟢 监控中', tip: '预测已发出，等待市场验证' },
    { status: 'validating', label: '🔄 验证中', tip: '1d 验证完成，等待 3d/7d 验证' },
    { status: 'validated', label: '✅ 已验证', tip: '全部时间窗口验证完成' },
    { status: 'expired', label: '⏰ 已过期', tip: '超过验证窗口未触发' },
    { status: 'completed', label: '✅ 已完成', tip: '预测流程已完成' },
    { status: 'failed', label: '❌ 失败', tip: '预测未命中' },
  ]

  cases.forEach(({ status, label, tip }) => {
    it(`renders correct label and tooltip for "${status}"`, () => {
      render(<StatusBadge status={status} />)
      const el = screen.getByText(label)
      expect(el).toBeInTheDocument()
      expect(el).toHaveAttribute('title', tip)
    })
  })

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="mystery" />)
    const el = screen.getByText('mystery')
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('title', 'mystery')
    expect(el.className).toContain('bg-gray-700')
  })
})
