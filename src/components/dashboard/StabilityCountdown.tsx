import { useState, useEffect } from 'react'

const STABILITY_START = new Date('2026-03-08T22:17:00+08:00').getTime()
const DURATION_MS = 72 * 60 * 60 * 1000
const STABILITY_TARGET = STABILITY_START + DURATION_MS

function formatHM(ms: number): string {
  if (ms <= 0) return '0h 0m'
  const totalMin = Math.floor(ms / 60_000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}h ${m}m`
}

export function StabilityCountdown() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const elapsedMs = Math.max(0, Math.min(now - STABILITY_START, DURATION_MS))
  const remainMs = Math.max(0, STABILITY_TARGET - now)
  const progressPct = Math.max(0, Math.min(100, (elapsedMs / DURATION_MS) * 100))
  const completed = now >= STABILITY_TARGET

  const barColor = completed
    ? 'bg-green-500 animate-pulse'
    : progressPct >= 50
      ? 'bg-green-500'
      : 'bg-yellow-500'

  const textColor = completed
    ? 'text-green-300'
    : progressPct >= 50
      ? 'text-green-300'
      : 'text-yellow-300'

  if (completed) {
    return (
      <section className="bg-gray-900 rounded-xl border border-green-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-gray-200">NT 72h Stability Test</h2>
        </div>
        <div className="text-2xl font-bold text-green-400 mb-3">
          ✅ 72h Stability Test PASSED
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
          <div className="h-2 rounded-full bg-green-500 animate-pulse w-full" />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Started: 03-08 22:17 CST</span>
          <span>Completed: 03-11 22:17 CST</span>
        </div>
      </section>
    )
  }

  return (
    <section className={`bg-gray-900 rounded-xl border ${progressPct >= 50 ? 'border-green-800' : 'border-yellow-800'} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-200">NT 72h Stability Test</h2>
        <span className="text-xs text-gray-500 font-mono">
          Target: 03-11 22:17 CST
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className={`text-2xl font-mono font-bold ${textColor}`}>
          {formatHM(elapsedMs)} / 72h
        </span>
        <span className="text-sm text-gray-400">
          {formatHM(remainMs)} remaining
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Started: 03-08 22:17 CST</span>
        <span>{progressPct.toFixed(1)}%</span>
      </div>
    </section>
  )
}
