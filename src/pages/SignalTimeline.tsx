import { useState, useMemo } from 'react'
import { useTimelineData } from '../hooks/useTimelineData'
import { useSymbols } from '../hooks/useSymbols'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import {
  SkeletonCards,
  TimelineCard,
  TimelineFilterBar,
  PAGE_SIZE,
  TIME_RANGES,
} from '../components/timeline'

function SignalTimeline() {
  const [symbol, setSymbol] = useState('')
  const [direction, setDirection] = useState('')
  const [hoursIdx, setHoursIdx] = useState(4) // default ALL
  const [page, setPage] = useState(0)

  const hours = TIME_RANGES[hoursIdx].hours
  const offset = page * PAGE_SIZE

  const { data, isLoading, error } = useTimelineData({
    symbol: symbol || undefined,
    direction: direction || undefined,
    hours: hours || undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const decisions = data?.decisions ?? []
  const total = data?.total ?? 0

  // Client-side direction filter (backend does not support direction param)
  const filteredDecisions = useMemo(() => {
    if (!direction) return decisions
    return decisions.filter(d => d.direction === direction)
  }, [decisions, direction])

  // Full symbol list from health endpoint
  const symbols = useSymbols()

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <SectionErrorBoundary title="Signal Timeline">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-bold text-gray-100">信号时间轴</h1>

        {/* Filters */}
        <TimelineFilterBar
          symbol={symbol}
          direction={direction}
          hoursIdx={hoursIdx}
          total={total}
          filteredCount={filteredDecisions.length}
          symbols={symbols}
          onSymbolChange={(v) => { setSymbol(v); setPage(0) }}
          onDirectionChange={(v) => { setDirection(v); setPage(0) }}
          onHoursChange={(idx) => { setHoursIdx(idx); setPage(0) }}
        />

        {/* Error state */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-sm text-red-400">
            加载失败：{error.message ?? '未知错误'}
          </div>
        )}

        {/* Loading */}
        {isLoading && <SkeletonCards />}

        {/* Timeline */}
        {!isLoading && !error && filteredDecisions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">暂无数据</p>
        )}

        {!isLoading && filteredDecisions.length > 0 && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[0.75rem] sm:left-[7rem] md:left-[8.5rem] top-0 bottom-0 w-px bg-gray-700" />

            <div className="space-y-4">
              {filteredDecisions.map((d) => (
                <TimelineCard key={d.id} decision={d} />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="text-xs text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </SectionErrorBoundary>
  )
}

export default SignalTimeline
