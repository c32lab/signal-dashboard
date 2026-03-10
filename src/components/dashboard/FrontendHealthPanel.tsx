import { useState, useEffect } from 'react'
import { getRecentErrors, getErrorCount, type TrackedError } from '../../utils/errorTracker'
import { getPerformanceMetrics } from '../../utils/performanceMonitor'

export default function FrontendHealthPanel() {
  const [errors, setErrors] = useState<TrackedError[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [pageLoadMs, setPageLoadMs] = useState<number | null>(null)
  const [avgApiMs, setAvgApiMs] = useState<number | null>(null)

  useEffect(() => {
    const refresh = () => {
      setErrors(getRecentErrors(10))
      setErrorCount(getErrorCount())
      const m = getPerformanceMetrics()
      setPageLoadMs(m.pageLoadMs)
      setAvgApiMs(m.avgApiResponseMs)
    }
    refresh()
    const id = setInterval(refresh, 5_000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-2 sm:p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-gray-200">Frontend Health</h2>
        {errorCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/60 text-red-300 border border-red-700">
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase">Page Load</span>
          <span className="text-lg font-mono font-semibold text-gray-100">
            {pageLoadMs != null ? `${pageLoadMs} ms` : '—'}
          </span>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1">
          <span className="text-xs text-gray-500 uppercase">Avg API Response</span>
          <span className="text-lg font-mono font-semibold text-gray-100">
            {avgApiMs != null ? `${avgApiMs} ms` : '—'}
          </span>
        </div>
      </div>

      {/* Recent errors */}
      {errors.length > 0 ? (
        <div className="space-y-1.5">
          <h3 className="text-xs text-gray-500 uppercase">Recent Errors</h3>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {errors.map((err, i) => (
              <div
                key={`${err.timestamp}-${i}`}
                className="bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2 text-xs"
              >
                <div className="flex justify-between gap-2">
                  <span className="text-red-300 truncate">{err.message}</span>
                  <span className="text-gray-600 shrink-0">
                    {new Date(err.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-600 truncate mt-0.5">{err.source}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-600">No frontend errors recorded.</div>
      )}
    </section>
  )
}
