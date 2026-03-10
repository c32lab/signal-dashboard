import type { ForecastPrediction } from '../../types'

interface ActivePredictionsListProps {
  predictions: ForecastPrediction[]
}

function directionBadge(direction: string): string {
  switch (direction) {
    case 'LONG':
      return 'bg-green-900 text-green-300'
    case 'SHORT':
      return 'bg-red-900 text-red-300'
    default:
      return 'bg-gray-800 text-gray-400'
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleString()
}

export default function ActivePredictionsList({ predictions }: ActivePredictionsListProps) {
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence).slice(0, 10)

  if (sorted.length === 0) {
    return <p className="text-sm text-gray-500">No active predictions</p>
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Active Predictions ({sorted.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-1.5 pr-3 font-medium">Symbol</th>
              <th className="text-left py-1.5 pr-3 font-medium">Direction</th>
              <th className="text-right py-1.5 pr-3 font-medium">Confidence</th>
              <th className="text-left py-1.5 pr-3 font-medium">Trigger</th>
              <th className="text-right py-1.5 pr-3 font-medium">Impact</th>
              <th className="text-left py-1.5 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-1.5 pr-3 text-gray-300 font-medium">{p.symbol.replace('/USDT', '')}</td>
                <td className="py-1.5 pr-3">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${directionBadge(p.direction)}`}>
                    {p.direction}
                  </span>
                </td>
                <td className="py-1.5 pr-3 text-right text-gray-300">{Math.round(p.confidence * 100)}%</td>
                <td className="py-1.5 pr-3 text-gray-500">{p.trigger_pattern}</td>
                <td className={`py-1.5 pr-3 text-right ${p.expected_impact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {p.expected_impact >= 0 ? '+' : ''}{p.expected_impact}%
                </td>
                <td className="py-1.5 text-gray-600">{formatTimestamp(p.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
