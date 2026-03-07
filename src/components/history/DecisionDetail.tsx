import type { RawDecisionJson } from '../../types'
import SignalBreakdownTable from './SignalBreakdownTable'
import DecisionMeta from './DecisionMeta'

function parseRawDecisionJson(rawJson?: string | object): RawDecisionJson | null {
  if (!rawJson) return null
  if (typeof rawJson === 'object') return rawJson as RawDecisionJson
  try {
    return JSON.parse(rawJson) as RawDecisionJson
  } catch {
    return null
  }
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

  return (
    <tr>
      <td colSpan={colSpan} className="bg-gray-800/50 border-t border-gray-700">
        <div className="px-4 py-3 space-y-3">
          <SignalBreakdownTable signals={signals} />
          <DecisionMeta
            agreeRatio={data.combined?.agree_ratio}
            combinedScore={data.combined_score}
            decisionType={data.decision_type}
            reasoning={data.reasoning}
          />
        </div>
      </td>
    </tr>
  )
}
