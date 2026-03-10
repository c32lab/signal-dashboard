import type { Decision } from '../../types'
import { validatePrice, validateConfidence } from '../../utils/dataValidation'
import { formatPrice } from '../../utils/format'
import DataWarning from '../DataWarning'
import { directionBadge, typeBadge, formatTs } from './decisionHelpers'

export default function DecisionCard({ d }: { d: Decision }) {
  const confV = validateConfidence(d.confidence)
  const zeroConf = d.confidence === 0 && d.action !== 'HOLD'
  const confWarn = !confV.valid
    ? confV.warning!
    : zeroConf
    ? `Confidence=0 but action=${d.action}`
    : undefined

  return (
    <div className="border border-gray-800 rounded-lg p-3 space-y-2 bg-gray-900/50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-200">
            {d.symbol.replace('/USDT', '')}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${directionBadge(d.direction)}`}>
            {d.direction}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadge(d.decision_type)}`}>
            {d.decision_type || '—'}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-mono">{String(d.id).slice(-6)}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="text-gray-500">Time</div>
        <div className="text-gray-400 text-right whitespace-nowrap">{formatTs(d.timestamp)}</div>

        <div className="text-gray-500">Action</div>
        <div className="text-gray-300 text-right">{d.action}</div>

        <div className="text-gray-500">Price</div>
        <div className="text-gray-300 text-right font-mono">
          {typeof d.price_at_decision === 'number' ? (
            <>
              {formatPrice(d.price_at_decision, d.symbol)}
              {(() => {
                const v = validatePrice(d.price_at_decision, d.symbol)
                return v.valid ? null : <DataWarning message={v.warning!} />
              })()}
            </>
          ) : '—'}
        </div>

        <div className="text-gray-500">Confidence</div>
        <div className="text-gray-300 text-right">
          {Math.round(d.confidence * 100)}%{/* confidence: decimal_0_1 → ×100 */}
          {confWarn && <DataWarning message={confWarn} />}
        </div>

        <div className="text-gray-500">Score</div>
        <div className="text-gray-400 text-right font-mono">
          {typeof d.combined_score === 'number' ? d.combined_score.toFixed(3) : '—'}
        </div>
      </div>

      {d.reasoning && (
        <p className="text-xs text-gray-500 truncate" title={d.reasoning}>
          {d.reasoning}
        </p>
      )}
    </div>
  )
}
