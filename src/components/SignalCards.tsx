import type { Signal } from '../types'
import { useSignalsLatest } from '../hooks/useApi'

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'AVAXUSDT', 'LINKUSDT']

function directionStyle(direction: string): { badge: string; bar: string; border: string } {
  switch (direction) {
    case 'LONG':
      return { badge: 'bg-green-900 text-green-300', bar: 'bg-green-500', border: 'border-green-800' }
    case 'SHORT':
      return { badge: 'bg-red-900 text-red-300', bar: 'bg-red-500', border: 'border-red-800' }
    default:
      return { badge: 'bg-gray-800 text-gray-400', bar: 'bg-gray-600', border: 'border-gray-700' }
  }
}

function formatTime(ts: string): string {
  const date = new Date(ts)
  if (isNaN(date.getTime())) return ts
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function SignalCard({ symbol, signal }: { symbol: string; signal: Signal | undefined }) {
  const label = symbol.replace('USDT', '')
  const direction = signal?.direction ?? '—'
  const confidence = signal?.confidence ?? 0
  const pct = Math.round(confidence * 100)
  const style = directionStyle(signal?.direction ?? '')

  return (
    <div className={`bg-gray-900 rounded-xl p-5 border ${style.border} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-white">{label}</span>
        {signal ? (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>
            {direction}
          </span>
        ) : (
          <span className="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-gray-800">N/A</span>
        )}
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500">Confidence</span>
          <span className="text-xs font-semibold text-gray-300">{signal ? `${pct}%` : '—'}</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
            style={{ width: signal ? `${pct}%` : '0%' }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-600">
        {signal ? formatTime(signal.timestamp) : 'No data'}
      </p>
    </div>
  )
}

export default function SignalCards() {
  const { data, error, isLoading } = useSignalsLatest()

  if (isLoading) {
    return <div className="px-6 text-gray-400 text-sm">Loading signals…</div>
  }

  if (error) {
    return (
      <div className="px-6 text-red-400 text-sm">
        Failed to load signals: {error?.message}
      </div>
    )
  }

  const signalMap: Record<string, Signal> = {}
  if (data) {
    for (const s of data) {
      signalMap[s.symbol] = s
    }
  }

  return (
    <div className="px-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Latest Signals
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {SYMBOLS.map((sym) => (
          <SignalCard key={sym} symbol={sym} signal={signalMap[sym]} />
        ))}
      </div>
    </div>
  )
}
