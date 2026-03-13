import type { Decision } from '../../types'
import { validatePrice, validateConfidence } from '../../utils/dataValidation'
import { formatPrice } from '../../utils/format'
import { parseCalibratedConfidence } from '../../utils/parseCalibrated'
import DataWarning from '../DataWarning'
import { directionBadge, typeBadge, formatTs } from './decisionHelpers'

export default function DecisionRow({ d }: { d: Decision }) {
  return (
    <tr className="border-t border-gray-800 hover:bg-gray-900 transition-colors">
      <td className="px-3 py-2 text-xs text-gray-500 font-mono">{String(d.id).slice(-6)}</td>
      <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">{formatTs(d.timestamp)}</td>
      <td className="px-3 py-2 text-xs font-semibold text-gray-200">
        {d.symbol.replace('/USDT', '')}
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${directionBadge(d.direction)}`}>
          {d.direction}
        </span>
      </td>
      <td className="px-3 py-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge(d.decision_type)}`}>
          {d.decision_type || '—'}
        </span>
      </td>
      <td className="px-3 py-2 text-xs text-gray-300">{d.action}</td>
      <td className="px-3 py-2 text-xs text-gray-300 text-right font-mono">
        {typeof d.price_at_decision === 'number' ? (
          <>
            {formatPrice(d.price_at_decision, d.symbol)}
            {(() => {
              const v = validatePrice(d.price_at_decision, d.symbol)
              return v.valid ? null : <DataWarning message={v.warning!} />
            })()}
          </>
        ) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-gray-300 text-right">
        {(() => {
          const confV = validateConfidence(d.confidence)
          const zeroConf = d.confidence === 0 && d.action !== 'HOLD'
          const warn = !confV.valid
            ? confV.warning!
            : zeroConf
            ? `Confidence=0 but action=${d.action}`
            : undefined
          const rawPct = Math.round(d.confidence * 100)
          const cal = d.calibrated_confidence ?? parseCalibratedConfidence(d.raw_json)
          const calPct = cal != null ? Math.round(cal * 100) : null
          const showCal = calPct != null && Math.abs(calPct - rawPct) > 1
          return (
            <>
              {rawPct}%
              {showCal && (
                <span className="text-blue-400" title="Raw → Calibrated"> → {calPct}%</span>
              )}
              {warn && <DataWarning message={warn} />}
            </>
          )
        })()}
      </td>
      <td className="px-3 py-2 text-xs text-gray-400 text-right">
        {typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '—'}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 max-w-[200px] sm:max-w-xs truncate" title={d.reasoning}>
        {d.reasoning}
      </td>
    </tr>
  )
}
