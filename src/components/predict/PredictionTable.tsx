import { DirectionBadge, StatusBadge } from './badges'
import { formatDateTime, formatPrice } from '../../utils/format'
import type { Prediction } from '../../types/predict'

export function PredictionTable({ predictions }: { predictions: Prediction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Direction</th>
            <th className="text-left py-2 px-3 font-medium">Confidence</th>
            <th className="text-left py-2 px-3 font-medium">Pattern</th>
            <th className="text-left py-2 px-3 font-medium">Impact</th>
            <th className="text-left py-2 px-3 font-medium">Price</th>
            <th className="text-left py-2 px-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p) => (
            <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 font-mono text-blue-300">{p.symbol}</td>
              <td className="py-2 px-3">
                <DirectionBadge direction={p.direction} />
              </td>
              {/* confidence: decimal_0_1 → ×100 */}
              <td className="py-2 px-3 text-gray-300">{(p.confidence * 100).toFixed(0)}%</td>
              <td className="py-2 px-3 text-gray-400 truncate max-w-[160px]">{p.trigger_pattern}</td>
              {/* expected_impact: already_pct — direct display, no ×100 */}
              <td className="py-2 px-3 text-gray-300">{p.expected_impact != null ? `${p.expected_impact.toFixed(1)}%` : '—'}</td>
              <td className="py-2 px-3 font-mono text-gray-300">
                {p.price_at_prediction != null ? formatPrice(p.price_at_prediction, p.symbol) : '—'}
              </td>
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                {formatDateTime(p.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PredictionHistoryTable({ predictions }: { predictions: Prediction[] }) {
  const sorted = [...predictions].sort((a, b) =>
    (b.created_at ?? b.timestamp ?? '').localeCompare(a.created_at ?? a.timestamp ?? '')
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left py-2 px-3 font-medium">Time</th>
            <th className="text-left py-2 px-3 font-medium">Symbol</th>
            <th className="text-left py-2 px-3 font-medium">Direction</th>
            <th className="text-left py-2 px-3 font-medium">Confidence</th>
            <th className="text-left py-2 px-3 font-medium">Trigger Pattern</th>
            <th className="text-left py-2 px-3 font-medium">Expected Impact</th>
            <th className="text-left py-2 px-3 font-medium">Price</th>
            <th className="text-left py-2 px-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                {formatDateTime(p.created_at ?? p.timestamp)}
              </td>
              <td className="py-2 px-3 font-mono text-blue-300">{p.symbol}</td>
              <td className="py-2 px-3">
                <DirectionBadge direction={p.direction} />
              </td>
              {/* confidence: decimal_0_1 → ×100 */}
              <td className="py-2 px-3 text-gray-300">{(p.confidence * 100).toFixed(0)}%</td>
              <td className="py-2 px-3 text-gray-400 truncate max-w-[160px]" title={p.trigger_pattern}>
                {p.trigger_pattern}
              </td>
              {/* expected_impact is already_pct — direct display, no ×100 */}
              <td className="py-2 px-3 text-gray-300">
                {p.expected_impact != null ? `${p.expected_impact.toFixed(1)}%` : '—'}
              </td>
              <td className="py-2 px-3 font-mono text-gray-300">
                {p.price_at_prediction != null ? formatPrice(p.price_at_prediction, p.symbol) : '—'}
              </td>
              <td className="py-2 px-3">
                <StatusBadge status={p.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
