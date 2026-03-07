import type { RawSignal } from '../../types'

function dirColor(dir: string): string {
  const d = dir?.toUpperCase()
  if (d === 'LONG') return 'text-green-400'
  if (d === 'SHORT') return 'text-red-400'
  return 'text-gray-400'
}

function strengthColor(s: number): string {
  if (s > 0) return 'text-green-400'
  if (s < 0) return 'text-red-400'
  return 'text-gray-400'
}

function SignalRow({ sig }: { sig: RawSignal }) {
  return (
    <tr className="border-t border-gray-700/50">
      <td className="px-2 py-1 font-mono text-gray-300 whitespace-nowrap">{sig.source}</td>
      <td className={`px-2 py-1 font-semibold whitespace-nowrap ${dirColor(sig.direction)}`}>
        {sig.direction || '—'}
      </td>
      <td className={`px-2 py-1 font-mono whitespace-nowrap ${strengthColor(sig.strength)}`}>
        {/* strength: -1 to 1, display as-is (raw_number) */}
        {typeof sig.strength === 'number' ? sig.strength.toFixed(2) : '—'}
      </td>
      <td className="px-2 py-1 font-mono text-gray-300 whitespace-nowrap">
        {/* confidence: decimal_0_1 → ×100 */}
        {typeof sig.confidence === 'number' ? `${Math.round(sig.confidence * 100)}%` : '—'}
      </td>
      <td className="px-2 py-1 text-gray-500 whitespace-nowrap">
        {sig.timeframe || '—'}
      </td>
      <td className="px-2 py-1 text-gray-400 max-w-[200px] sm:max-w-xs truncate" title={sig.reasoning}>
        {sig.reasoning || '—'}
      </td>
    </tr>
  )
}

interface SignalBreakdownTableProps {
  signals: RawSignal[]
}

export default function SignalBreakdownTable({ signals }: SignalBreakdownTableProps) {
  if (signals.length === 0) {
    return <p className="text-xs text-gray-600 italic">No signal breakdown available</p>
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        Signal Breakdown
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[500px]">
          <thead>
            <tr className="text-gray-600 uppercase tracking-wider text-[10px]">
              <th className="px-2 py-1 text-left font-semibold">Source</th>
              <th className="px-2 py-1 text-left font-semibold">Dir</th>
              <th className="px-2 py-1 text-left font-semibold">Str</th>
              <th className="px-2 py-1 text-left font-semibold">Conf</th>
              <th className="px-2 py-1 text-left font-semibold">TF</th>
              <th className="px-2 py-1 text-left font-semibold">Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((sig, i) => (
              <SignalRow key={`${sig.source}-${i}`} sig={sig} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
