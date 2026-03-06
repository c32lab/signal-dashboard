import type { CollectorHealthResponse } from '../../types'

export function CollectorStatus({ data }: { data: CollectorHealthResponse }) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Collector Status</h2>
      <div className="flex flex-wrap gap-2">
        {data.collectors.map((c) => {
          const pillColor = c.is_disabled
            ? 'bg-red-900/60 border-red-700 text-red-300'
            : c.is_degraded
            ? 'bg-yellow-900/60 border-yellow-700 text-yellow-300'
            : 'bg-green-900/40 border-green-800 text-green-400'
          return (
            <span
              key={c.name}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${pillColor}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  c.is_disabled ? 'bg-red-400' : c.is_degraded ? 'bg-yellow-400' : 'bg-green-400'
                }`}
              />
              {c.name}
              {c.error_count > 0 && (
                <span className="opacity-75">({c.error_count} err)</span>
              )}
            </span>
          )
        })}
      </div>
    </section>
  )
}
