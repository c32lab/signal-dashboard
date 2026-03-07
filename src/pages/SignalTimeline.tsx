import { useState, useMemo } from 'react'
import { useTimelineData } from '../hooks/useTimelineData'
import { useSymbols } from '../hooks/useSymbols'
import { formatDateTime, formatPrice } from '../utils/format'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

const PAGE_SIZE = 30

const TIME_RANGES = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: 'ALL', hours: 0 },
] as const

const DIRECTIONS = ['ALL', 'LONG', 'SHORT', 'HOLD'] as const

function stripUsdt(symbol: string): string {
  return symbol.replace(/USDT$/i, '')
}

const directionColor: Record<string, string> = {
  LONG: 'border-l-green-500',
  SHORT: 'border-l-red-500',
  HOLD: 'border-l-gray-500',
}

const directionBadge: Record<string, string> = {
  LONG: 'bg-green-900/50 text-green-400',
  SHORT: 'bg-red-900/50 text-red-400',
  HOLD: 'bg-gray-700 text-gray-400',
}

function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-28 shrink-0">
            <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 border-l-4 border-l-gray-700 space-y-3">
            <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-64 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ReasoningText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 120

  return (
    <div>
      <p className={`text-xs text-gray-400 ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-blue-400 hover:text-blue-300 mt-1"
        >
          {expanded ? '收起' : '展开'}
        </button>
      )}
    </div>
  )
}

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
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={symbol}
            onChange={(e) => { setSymbol(e.target.value); setPage(0) }}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">全部币种</option>
            {symbols.map((s) => (
              <option key={s} value={s}>{stripUsdt(s)}</option>
            ))}
          </select>

          <select
            value={direction}
            onChange={(e) => { setDirection(e.target.value); setPage(0) }}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
          >
            {DIRECTIONS.map((d) => (
              <option key={d} value={d === 'ALL' ? '' : d}>{d}</option>
            ))}
          </select>

          <div className="flex gap-1">
            {TIME_RANGES.map((tr, idx) => (
              <button
                key={tr.label}
                onClick={() => { setHoursIdx(idx); setPage(0) }}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  hoursIdx === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>

          {total > 0 && (
            <span className="text-xs text-gray-500 ml-auto">
              {direction ? `${filteredDecisions.length} / ` : ''}共 {total} 条
            </span>
          )}
        </div>

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
                <div key={d.id} className="flex flex-col sm:flex-row gap-1 sm:gap-4 relative pl-6 sm:pl-0">
                  {/* Time label */}
                  <div className="sm:w-24 md:w-32 shrink-0 sm:text-right sm:pr-4 sm:pt-3">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDateTime(d.timestamp)}
                    </span>
                  </div>
                  {/* Dot on the line */}
                  <div className="absolute left-[0.5rem] sm:left-[6.75rem] md:left-[8.25rem] top-1 sm:top-4 w-2 h-2 rounded-full bg-gray-600 border-2 border-gray-950 z-10" />
                  {/* Card */}
                  <div
                    className={`flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 border-l-4 ${
                      directionColor[d.direction] ?? 'border-l-gray-600'
                    } space-y-2`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-100">
                        {stripUsdt(d.symbol)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        directionBadge[d.direction] ?? 'bg-gray-700 text-gray-400'
                      }`}>
                        {d.direction}
                      </span>
                      <span className="text-xs text-gray-500">{d.action}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                      <span>置信度 <span className="text-gray-200">{(d.confidence * 100).toFixed(1)}%</span></span>
                      <span>综合分 <span className="text-gray-200">{d.combined_score.toFixed(2)}</span></span>
                      <span>价格 <span className="text-gray-200">{formatPrice(d.price_at_decision, d.symbol)}</span></span>
                    </div>
                    {d.reasoning && <ReasoningText text={d.reasoning} />}
                  </div>
                </div>
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
