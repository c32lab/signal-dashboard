import { useState, useEffect } from 'react'

const STABILITY_TARGET = new Date('2026-03-11T22:17:00+08:00').getTime()
const STABILITY_START = new Date('2026-03-08T22:17:00+08:00').getTime()
const TOTAL_MS = STABILITY_TARGET - STABILITY_START // 72h in ms

type Status = 'running' | 'passed' | 'failed'

function getStatus(remainMs: number, healthOk: boolean): Status {
  if (remainMs <= 0) return healthOk ? 'passed' : 'failed'
  return 'running'
}

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0')
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const h = ms / 3_600_000
  const m = (ms % 3_600_000) / 60_000
  const s = (ms % 60_000) / 1_000
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

const statusConfig = {
  running: { label: 'Running', dot: 'bg-blue-400 animate-pulse', border: 'border-blue-800', bg: 'bg-blue-900/20', text: 'text-blue-300' },
  passed:  { label: 'Passed',  dot: 'bg-green-400', border: 'border-green-800', bg: 'bg-green-900/20', text: 'text-green-300' },
  failed:  { label: 'Failed',  dot: 'bg-red-400',   border: 'border-red-800',   bg: 'bg-red-900/20',   text: 'text-red-300' },
} as const

export function StabilityCountdown() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  const remainMs = Math.max(0, STABILITY_TARGET - now)
  const elapsedMs = Math.min(now - STABILITY_START, TOTAL_MS)
  const progressPct = Math.max(0, Math.min(100, (elapsedMs / TOTAL_MS) * 100))
  const status = getStatus(remainMs, true)
  const cfg = statusConfig[status]

  return (
    <section className={`bg-gray-900 rounded-xl border ${cfg.border} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <h2 className="text-sm font-semibold text-gray-200">72h Stability Test</h2>
          <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
        </div>
        <span className="text-xs text-gray-500 font-mono">
          Target: 03-11 22:17
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-3xl font-mono font-bold ${cfg.text}`}>
          {formatRemaining(remainMs)}
        </span>
        <span className="text-xs text-gray-500">remaining</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            status === 'passed' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Started 03-08 22:17</span>
        <span>{progressPct.toFixed(1)}%</span>
      </div>
    </section>
  )
}
