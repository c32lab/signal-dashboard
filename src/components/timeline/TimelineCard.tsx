import type { Decision } from '../../types'
import { formatDateTime, formatPrice } from '../../utils/format'
import { stripUsdt, directionColor, directionBadge } from './constants'
import ReasoningText from './ReasoningText'

export default function TimelineCard({ decision: d }: { decision: Decision }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 relative pl-6 sm:pl-0">
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
          <span>Confidence <span className="text-gray-200">{(d.confidence * 100).toFixed(1)}%</span></span>
          <span>Score <span className="text-gray-200">{d.combined_score.toFixed(2)}</span></span>
          <span>Price <span className="text-gray-200">{formatPrice(d.price_at_decision, d.symbol)}</span></span>
        </div>
        {d.reasoning && <ReasoningText text={d.reasoning} />}
      </div>
    </div>
  )
}
