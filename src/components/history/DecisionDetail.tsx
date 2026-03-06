import type { RawDecisionJson, RawSignal } from '../../types'

function parseRawDecisionJson(rawJson?: string | object): RawDecisionJson | null {
  if (!rawJson) return null
  if (typeof rawJson === 'object') return rawJson as RawDecisionJson
  try {
    return JSON.parse(rawJson) as RawDecisionJson
  } catch {
    return null
  }
}

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
      <td className="px-2 py-1 text-gray-400 max-w-xs truncate" title={sig.reasoning}>
        {sig.reasoning || '—'}
      </td>
    </tr>
  )
}

export default function DecisionDetail({
  rawJson,
  colSpan,
}: {
  rawJson?: string
  colSpan: number
}) {
  const data = parseRawDecisionJson(rawJson)

  if (!data) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-3 bg-gray-800/50 border-t border-gray-700 text-xs text-gray-500 italic">
          No detail data
        </td>
      </tr>
    )
  }

  const signals = data.combined?.signals ?? []
  const agreeRatio = data.combined?.agree_ratio

  return (
    <tr>
      <td colSpan={colSpan} className="bg-gray-800/50 border-t border-gray-700">
        <div className="px-4 py-3 space-y-3">
          {/* Signal Breakdown */}
          {signals.length > 0 ? (
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
          ) : (
            <p className="text-xs text-gray-600 italic">No signal breakdown available</p>
          )}

          {/* Decision Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-700/50 pt-2">
            {agreeRatio != null && (
              <span>
                <span className="text-gray-600">Agree ratio: </span>
                <span className="text-gray-300 font-mono">{(agreeRatio * 100).toFixed(1)}%</span>
              </span>
            )}
            {data.combined_score != null && (
              <span>
                <span className="text-gray-600">Combined score: </span>
                <span className={`font-mono ${data.combined_score > 0 ? 'text-green-400' : data.combined_score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {data.combined_score.toFixed(3)}
                </span>
              </span>
            )}
            {data.decision_type && (
              <span>
                <span className="text-gray-600">Type: </span>
                <span className="text-gray-300">{data.decision_type}</span>
              </span>
            )}
          </div>

          {data.reasoning && (
            <p className="text-xs text-gray-500 border-t border-gray-700/50 pt-2">
              <span className="text-gray-600">Reasoning: </span>
              {data.reasoning}
            </p>
          )}
        </div>
      </td>
    </tr>
  )
}
