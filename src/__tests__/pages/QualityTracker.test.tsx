/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock all hooks used by QualityTracker
vi.mock('../../hooks/useApi', () => ({
  usePerformance: vi.fn(),
  useAccuracyTrend: vi.fn(),
  useSignalQuality: vi.fn(),
  useAccuracy: vi.fn(),
  useConfidence: vi.fn(),
}))

// Mock child components
vi.mock('../../components/LastUpdated', () => ({ default: () => <div data-testid="LastUpdated" /> }))
vi.mock('../../components/CombinerWeights', () => ({ default: () => <div data-testid="CombinerWeights" /> }))
vi.mock('../../components/SectionErrorBoundary', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid={`section-${title}`}>{children}</div>
  ),
}))
vi.mock('../../components/quality', () => ({
  OverallSummary: ({ overall }: { overall: unknown }) => <div data-testid="OverallSummary">{JSON.stringify(overall)}</div>,
  AccuracyOverview: ({ data }: { data: unknown }) => <div data-testid="AccuracyOverview">{JSON.stringify(data)}</div>,
  AccuracyLeaderboard: ({ data }: { data: unknown }) => <div data-testid="AccuracyLeaderboard">{JSON.stringify(data)}</div>,
  AccuracyTrend: () => <div data-testid="AccuracyTrend" />,
  SignalQualityTable: () => <div data-testid="SignalQualityTable" />,
  AccuracyTrendChart: () => <div data-testid="AccuracyTrendChart" />,
  SectionSkeleton: ({ text }: { text: string }) => <div data-testid="SectionSkeleton">{text}</div>,
  SectionError: ({ message }: { message: string }) => <div data-testid="SectionError">{message}</div>,
  ConfidenceDistribution: ({ data }: { data: unknown }) => <div data-testid="ConfidenceDistribution">{JSON.stringify(data)}</div>,
}))

import QualityTracker from '../../pages/QualityTracker'
import { usePerformance, useAccuracyTrend, useSignalQuality, useAccuracy, useConfidence } from '../../hooks/useApi'

const mockUsePerformance = vi.mocked(usePerformance)
const mockUseAccuracyTrend = vi.mocked(useAccuracyTrend)
const mockUseSignalQuality = vi.mocked(useSignalQuality)
const mockUseAccuracy = vi.mocked(useAccuracy)
const mockUseConfidence = vi.mocked(useConfidence)

function makeSWRLoading() {
  return { data: undefined, isLoading: true, error: undefined } as unknown
}

function makeSWRError(msg: string) {
  return { data: undefined, isLoading: false, error: new Error(msg) } as unknown
}

function mockAllLoading() {
  const loading = makeSWRLoading()
  mockUsePerformance.mockReturnValue(loading as ReturnType<typeof usePerformance>)
  mockUseAccuracyTrend.mockReturnValue(loading as ReturnType<typeof useAccuracyTrend>)
  mockUseSignalQuality.mockReturnValue(loading as ReturnType<typeof useSignalQuality>)
  mockUseAccuracy.mockReturnValue(loading as ReturnType<typeof useAccuracy>)
  mockUseConfidence.mockReturnValue(loading as ReturnType<typeof useConfidence>)
}

function mockAllError() {
  mockUsePerformance.mockReturnValue(makeSWRError('perf fail') as ReturnType<typeof usePerformance>)
  mockUseAccuracyTrend.mockReturnValue(makeSWRError('trend fail') as ReturnType<typeof useAccuracyTrend>)
  mockUseSignalQuality.mockReturnValue(makeSWRError('quality fail') as ReturnType<typeof useSignalQuality>)
  mockUseAccuracy.mockReturnValue(makeSWRError('accuracy fail') as ReturnType<typeof useAccuracy>)
  mockUseConfidence.mockReturnValue(makeSWRError('confidence fail') as ReturnType<typeof useConfidence>)
}

function mockAllWithData() {
  mockUsePerformance.mockReturnValue({
    data: { overall: { win_rate: 0.6 }, by_symbol: [{ symbol: 'BTC', win_rate: 0.7 }] },
    isLoading: false,
    error: undefined,
  } as unknown as ReturnType<typeof usePerformance>)
  mockUseAccuracyTrend.mockReturnValue({
    data: [{ hour: '2026-01-01T00:00:00Z', accuracy: 0.8 }],
    isLoading: false,
    error: undefined,
  } as unknown as ReturnType<typeof useAccuracyTrend>)
  mockUseSignalQuality.mockReturnValue({
    data: { by_symbol: { BTC: { long: 10, short: 5, hold: 3 } } },
    isLoading: false,
    error: undefined,
  } as unknown as ReturnType<typeof useSignalQuality>)
  mockUseAccuracy.mockReturnValue({
    data: { overall: 0.75 },
    isLoading: false,
    error: undefined,
  } as unknown as ReturnType<typeof useAccuracy>)
  mockUseConfidence.mockReturnValue({
    data: { buckets: [0.5, 0.8] },
    isLoading: false,
    error: undefined,
  } as unknown as ReturnType<typeof useConfidence>)
}

describe('QualityTracker', () => {
  it('renders loading skeletons when all hooks are loading', () => {
    mockAllLoading()
    render(<QualityTracker />)
    const skeletons = screen.getAllByTestId('SectionSkeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
    expect(screen.getByText('Loading overall performance…')).toBeInTheDocument()
    expect(screen.getByText('Loading accuracy overview…')).toBeInTheDocument()
    expect(screen.getByText('Loading leaderboard…')).toBeInTheDocument()
  })

  it('renders error messages when hooks return errors', () => {
    mockAllError()
    render(<QualityTracker />)
    const errors = screen.getAllByTestId('SectionError')
    expect(errors.length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByText(/perf fail/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/trend fail/)).toBeInTheDocument()
    expect(screen.getByText(/quality fail/)).toBeInTheDocument()
    expect(screen.getByText(/accuracy fail/)).toBeInTheDocument()
  })

  it('renders data sections when hooks return data', () => {
    mockAllWithData()
    render(<QualityTracker />)
    expect(screen.getByTestId('OverallSummary')).toBeInTheDocument()
    expect(screen.getByTestId('AccuracyOverview')).toBeInTheDocument()
    expect(screen.getByTestId('AccuracyLeaderboard')).toBeInTheDocument()
    expect(screen.getByTestId('AccuracyTrend')).toBeInTheDocument()
    expect(screen.getByTestId('SignalQualityTable')).toBeInTheDocument()
    expect(screen.getByTestId('CombinerWeights')).toBeInTheDocument()
    expect(screen.getByTestId('ConfidenceDistribution')).toBeInTheDocument()
  })

  it('renders always-visible components regardless of state', () => {
    mockAllLoading()
    render(<QualityTracker />)
    expect(screen.getByTestId('LastUpdated')).toBeInTheDocument()
    expect(screen.getByTestId('AccuracyTrendChart')).toBeInTheDocument()
    expect(screen.getByTestId('CombinerWeights')).toBeInTheDocument()
  })
})
