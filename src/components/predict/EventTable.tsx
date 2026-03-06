import type { Event } from '../../types/predict'

export function EventTable({ events }: { events: Event[] }) {
  const sorted = [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Date</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Event</th>
            <th className="text-left py-2 px-3 font-medium">Category</th>
            <th className="text-left py-2 px-3 font-medium">ΔPrice</th>
            <th className="text-left py-2 px-3 font-medium">Tags</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((e) => (
            <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{e.date}</td>
              <td className="py-2 px-3 font-mono text-blue-300">{e.symbol}</td>
              <td className="py-2 px-3 text-gray-300 max-w-[260px]">
                <span title={e.event}>{e.event?.length > 60 ? e.event.slice(0, 60) + '…' : e.event}</span>
              </td>
              <td className="py-2 px-3 text-gray-400">{e.category}</td>
              {/* price_change: already_pct — direct display, no ×100 */}
              <td
                className={`py-2 px-3 font-mono font-bold ${
                  e.price_change > 0 ? 'text-red-400' : e.price_change < 0 ? 'text-green-400' : 'text-gray-400'
                }`}
              >
                {e.price_change != null ? `${e.price_change > 0 ? '+' : ''}${e.price_change.toFixed(2)}%` : '—'}
              </td>
              <td className="py-2 px-3">
                <div className="flex flex-wrap gap-1">
                  {(e.tags ?? []).slice(0, 3).map((t) => (
                    <span key={t} className="px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">{t}</span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
