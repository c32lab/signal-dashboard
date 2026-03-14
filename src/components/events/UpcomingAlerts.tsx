import { useMemo } from 'react'
import type { ForwardEvent } from './types'
import { mockForwardEvents } from './mockData'
import { useForwardEvents } from '../../hooks/useForwardEvents'
import { DIRECTION_COLOR, DIRECTION_ARROW, IMPACT_ORDER } from './eventUtils'

function impactBorderClass(impact: ForwardEvent['impact']) {
  if (impact === 'high') return 'border-l-red-500'
  if (impact === 'medium') return 'border-l-yellow-500'
  return 'border-l-green-500'
}

function directionBadge(event: ForwardEvent) {
  if (event.sample_count < 5) {
    return <span className="text-xs text-gray-500 italic">No signal</span>
  }
  return (
    <span className={`text-xs font-semibold ${DIRECTION_COLOR[event.direction]}`}>
      {DIRECTION_ARROW[event.direction]} {Math.round(event.direction_probability * 100)}%
    </span>
  )
}

function impactLabel(impact: ForwardEvent['impact']) {
  const cls =
    impact === 'high'
      ? 'bg-red-900/50 text-red-300'
      : impact === 'medium'
        ? 'bg-yellow-900/50 text-yellow-300'
        : 'bg-gray-800 text-gray-400'
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs ${cls}`}>
      {impact}
    </span>
  )
}

export default function UpcomingAlerts() {
  const { events: liveEvents, error, isLoading } = useForwardEvents()

  const useFallback = !!error || (!isLoading && liveEvents.length === 0)
  const events = useFallback ? mockForwardEvents : liveEvents

  const sorted = useMemo(
    () =>
      [...events]
        .sort((a, b) => {
          if (a.days_until !== b.days_until) return a.days_until - b.days_until
          return IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
        })
        .slice(0, 5),
    [events],
  )

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-200">
          Upcoming Alerts
        </span>
        {useFallback && (
          <span className="text-xs text-yellow-500/80 bg-yellow-500/10 px-1.5 py-0.5 rounded">
            demo data
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="px-4 pb-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-gray-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="px-4 pb-4 text-gray-600 text-xs">
          No upcoming alerts
        </p>
      ) : (
        <div className="px-4 pb-4 space-y-2">
          {sorted.map((ev) => (
            <div
              key={ev.event_id}
              className={`border-l-2 ${impactBorderClass(ev.impact)} bg-gray-800/30 rounded-r-lg pl-3 pr-3 py-2`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-200 font-medium truncate">
                  {ev.title}
                </span>
                {impactLabel(ev.impact)}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {directionBadge(ev)}
                <span className="text-xs text-gray-500">
                  {ev.days_until === 0
                    ? 'Today'
                    : ev.days_until === 1
                      ? 'Tomorrow'
                      : `in ${ev.days_until} days`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
