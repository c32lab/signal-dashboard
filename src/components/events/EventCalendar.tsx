import { useState, useMemo } from 'react'
import type { ForwardEvent } from './types'
import { useForwardEvents } from '../../hooks/useForwardEvents'
import { DIRECTION_COLOR, DIRECTION_ARROW } from './eventUtils'

function impactDot(impact: ForwardEvent['impact']) {
  const cls =
    impact === 'high'
      ? 'bg-red-500'
      : impact === 'medium'
        ? 'bg-yellow-500'
        : 'bg-green-500'
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />
}

function impactLabel(impact: ForwardEvent['impact']) {
  return impact === 'high' ? 'High' : impact === 'medium' ? 'Medium' : 'Low'
}

function SampleBadge({ count }: { count: number }) {
  if (count < 5)
    return (
      <span className="text-xs text-gray-500 italic">Insufficient data</span>
    )
  if (count < 20)
    return (
      <span className="text-xs text-yellow-500">
        ⚠️ Low sample (n={count})
      </span>
    )
  return <span className="text-xs text-gray-500">n={count}</span>
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  })
}

function EventCard({
  event,
  expanded,
  onToggle,
}: {
  event: ForwardEvent
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/80 transition-colors border border-gray-700/50 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-200 truncate">
              {event.title}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {impactDot(event.impact)} {impactLabel(event.impact)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            {event.sample_count < 5 ? (
              <SampleBadge count={event.sample_count} />
            ) : (
              <>
                <span className={`text-sm font-semibold ${DIRECTION_COLOR[event.direction]}`}>
                  <span className={DIRECTION_COLOR[event.direction]}>
                    {DIRECTION_ARROW[event.direction]}
                  </span>{' '}
                  {Math.round(event.direction_probability * 100)}%
                </span>
                <SampleBadge count={event.sample_count} />
              </>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {event.days_until === 0
            ? 'Today'
            : event.days_until === 1
              ? 'Tomorrow'
              : `${event.days_until}d`}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
          <p className="text-xs text-gray-400 leading-relaxed">
            {event.reasoning}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Avg Move</span>
              <p className="text-gray-300 font-mono">
                {event.avg_move_pct.toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-gray-500">Volatility</span>
              <p className="text-gray-300 font-mono">
                {event.volatility_expected.toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-gray-500">Confidence</span>
              <p className="text-gray-300 font-mono">
                {Math.round(event.confidence * 100)}%
              </p>
            </div>
            <div>
              <span className="text-gray-500">Category</span>
              <p className="text-gray-300 capitalize">{event.category}</p>
            </div>
          </div>
        </div>
      )}
    </button>
  )
}

export default function EventCalendar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { events, error, isLoading } = useForwardEvents()

  const grouped = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.days_until - b.days_until)
    const map = new Map<number, ForwardEvent[]>()
    for (const ev of sorted) {
      const day = ev.days_until
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(ev)
    }
    return map
  }, [events])

  const dayLabel = (d: number) =>
    d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `Day +${d}`

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-gray-200">
            Event Calendar
          </span>
          <span className="text-xs text-gray-500">Next 7 days</span>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-gray-500 hover:text-gray-300 text-xs transition-colors shrink-0"
        >
          {collapsed ? '▼ expand' : '▲ collapse'}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4">
          {isLoading ? (
            <div className="flex gap-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[220px] h-24 bg-gray-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400 text-xs py-4">
              Failed to load events
            </p>
          ) : grouped.size === 0 ? (
            <p className="text-gray-600 text-xs py-4">
              No upcoming events in the next 7 days
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from(grouped.entries()).map(([day, dayEvents]) => (
                <div key={day} className="min-w-[220px] flex-shrink-0">
                  <div className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <span>{dayLabel(day)}</span>
                    <span className="text-gray-600">
                      {formatEventDate(dayEvents[0].event_date)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map((ev) => (
                      <EventCard
                        key={ev.event_id}
                        event={ev}
                        expanded={expandedId === ev.event_id}
                        onToggle={() =>
                          setExpandedId((prev) =>
                            prev === ev.event_id ? null : ev.event_id,
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
