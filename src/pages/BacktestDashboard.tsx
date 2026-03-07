import { useState, useMemo } from 'react'
import { useBacktest } from '../hooks/useApi'
import { formatDateTime, formatDate } from '../utils/format'
import { BacktestResultView, BacktestSkeleton } from '../components/backtest'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

export default function BacktestDashboard() {
  const { data, error, isLoading } = useBacktest()
  const [activeIdx, setActiveIdx] = useState(0)

  // Detect duplicate tab labels to add index prefix — must be before early returns (hooks rule)
  const tabLabels = useMemo(() => {
    if (!data || data.results.length === 0) return []
    const raw = data.results.map(r =>
      r.data_range
        ? `${formatDate(r.data_range.start)} – ${formatDate(r.data_range.end)}`
        : formatDateTime(r.generated_at) || 'Backtest'
    )
    const counts = new Map<string, number>()
    raw.forEach(l => counts.set(l, (counts.get(l) ?? 0) + 1))
    const seen = new Map<string, number>()
    return raw.map(l => {
      if ((counts.get(l) ?? 0) > 1) {
        const idx = (seen.get(l) ?? 0) + 1
        seen.set(l, idx)
        return `#${idx} ${l}`
      }
      return l
    })
  }, [data])

  if (isLoading) return <BacktestSkeleton />

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-950 border border-red-800 text-red-300 rounded-xl p-4 text-sm">
          Failed to load backtest data: {error.message}
        </div>
      </div>
    )
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
          No backtest data available.
        </div>
      </div>
    )
  }

  // Clamp activeIdx to avoid out-of-bounds after data reload
  const safeIdx = Math.min(activeIdx, data.results.length - 1)
  const result = data.results[safeIdx] ?? data.results[0]

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Multi-result tabs */}
      {data.results.length > 1 && (
        <SectionErrorBoundary title="Result Tabs">
          <div className="flex gap-1 border-b border-gray-800 overflow-x-auto">
            {data.results.map((_r, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`px-4 py-2 text-sm whitespace-nowrap transition-colors border-b-2 ${
                  idx === safeIdx
                    ? 'text-blue-400 border-blue-400 font-semibold'
                    : 'text-gray-500 border-transparent hover:text-gray-300'
                }`}
              >
                {tabLabels[idx]}
              </button>
            ))}
          </div>
        </SectionErrorBoundary>
      )}
      <SectionErrorBoundary title="Backtest Result">
        <BacktestResultView result={result} />
      </SectionErrorBoundary>
    </div>
  )
}
