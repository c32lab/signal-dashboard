import type { Decision } from '../../types'
import { validatePrice, validateConfidence } from '../../utils/dataValidation'
import DataWarning from '../DataWarning'
import {
  actionBadge, dirBadge, typeBadge, scoreColor,
  formatTs, formatPrice, stripUsdt, parseRawJson,
} from './utils'

export default function DecisionRow({ d }: { d: Decision }) {
  const { stop_loss, take_profit } = parseRawJson(d.raw_json)
  const confV = validateConfidence(d.confidence)
  const priceV = validatePrice(d.price_at_decision, d.symbol)
  const zeroConf = d.confidence === 0 && d.action !== 'HOLD'
  const confWarn = !confV.valid
    ? confV.warning
    : zeroConf
    ? `Confidence=0 但 action=${d.action}`
    : undefined

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-900/80 transition-colors">
      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap font-mono">
        {formatTs(d.timestamp)}
      </td>
      <td className="px-3 py-2 text-xs font-semibold text-gray-200">
        {stripUsdt(d.symbol)}
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionBadge(d.action)}`}>
          {d.action}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dirBadge(d.direction)}`}>
          {d.direction || '—'}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge(d.decision_type)}`}>
          {d.decision_type || '—'}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono">
        {typeof d.confidence === 'number' ? (
          <>
            <span className={confWarn ? 'text-amber-400' : 'text-gray-300'}>
              {/* confidence: decimal_0_1 → ×100 */}
              {Math.round(d.confidence * 100)}%
            </span>
            {confWarn && <DataWarning message={confWarn} />}
          </>
        ) : '—'}
      </td>
      <td className={`px-3 py-2 text-xs text-right font-mono ${typeof d.combined_score === 'number' ? scoreColor(d.combined_score) : 'text-gray-400'}`}>
        {typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono text-gray-300">
        {typeof d.price_at_decision === 'number' ? (
          <>
            {formatPrice(d.price_at_decision)}
            {!priceV.valid && <DataWarning message={priceV.warning!} />}
          </>
        ) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono text-gray-400">
        {formatPrice(stop_loss)}
      </td>
      <td className="px-3 py-2 text-xs text-right font-mono text-gray-400">
        {formatPrice(take_profit)}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate" title={d.reasoning}>
        {d.reasoning}
      </td>
    </tr>
  )
}
