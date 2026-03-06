import { useState } from 'react'
import { DirectionBadge, StatusBadge } from './badges'
import { formatDateTime, formatPrice } from '../../utils/format'
import type { Prediction } from '../../types/predict'
import { usePredictionDetail } from '../../hooks/usePredictApi'

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

function DetailPanel({ id, reasoning }: { id: number; reasoning: string }) {
  const { data, error, isLoading } = usePredictionDetail(id)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-gray-500 text-sm">
        <span className="animate-spin">⏳</span> 加载详情中…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 text-sm">
        ⚠️ 加载详情失败：{String(error?.message ?? error)}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 text-sm">
      {/* Brief summary from original reasoning field */}
      {reasoning && (
        <div className="bg-gray-800 rounded px-3 py-2 text-gray-300 italic text-xs">
          {reasoning}
        </div>
      )}

      {/* Trigger Event */}
      {data?.trigger_event_text && (
        <div>
          <div className="text-gray-500 font-semibold mb-1 uppercase tracking-wide text-xs">触发事件</div>
          <div className="bg-blue-950 border border-blue-800 rounded px-3 py-2 text-blue-200">
            {data.trigger_event_text}
          </div>
        </div>
      )}

      {/* Matched Events */}
      {data?.matched_events && data.matched_events.length > 0 && (
        <div>
          <div className="text-gray-500 font-semibold mb-1 uppercase tracking-wide text-xs">匹配历史事件</div>
          <table className="w-full text-xs border border-gray-800 rounded overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-gray-400">
                <th className="text-left py-1.5 px-2 font-medium">事件</th>
                <th className="text-left py-1.5 px-2 font-medium">日期</th>
                <th className="text-left py-1.5 px-2 font-medium">Symbol</th>
                <th className="text-right py-1.5 px-2 font-medium">价格变动</th>
                <th className="text-right py-1.5 px-2 font-medium">相似度</th>
              </tr>
            </thead>
            <tbody>
              {data.matched_events.map((ev) => (
                <tr key={ev.event_id} className="border-t border-gray-800">
                  <td className="py-1.5 px-2 text-gray-300 truncate max-w-[240px]" title={ev.event}>
                    {ev.event}
                  </td>
                  <td className="py-1.5 px-2 text-gray-500 whitespace-nowrap">{formatDateTime(ev.date)}</td>
                  <td className="py-1.5 px-2 font-mono text-blue-300">{ev.symbol}</td>
                  {/* price_change: already_pct — direct display */}
                  <td className={`py-1.5 px-2 text-right font-mono ${ev.price_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {ev.price_change >= 0 ? '+' : ''}{ev.price_change.toFixed(2)}%
                  </td>
                  {/* similarity: decimal_0_1 → ×100 */}
                  <td className="py-1.5 px-2 text-right text-gray-300">
                    {(ev.similarity * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reasoning Chain */}
      {data?.reasoning_chain && data.reasoning_chain.length > 0 && (
        <div>
          <div className="text-gray-500 font-semibold mb-1 uppercase tracking-wide text-xs">推理链</div>
          <ol className="space-y-1">
            {data.reasoning_chain.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-gray-700 text-gray-300 text-xs flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <span className="text-blue-400 font-medium">[{step.step}]</span>{' '}
                  <span className="text-gray-300">{step.content}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Confidence Factors */}
      {data?.confidence_factors && Object.keys(data.confidence_factors).length > 0 && (
        <div>
          <div className="text-gray-500 font-semibold mb-1 uppercase tracking-wide text-xs">置信度因子</div>
          <div className="space-y-1">
            {Object.entries(data.confidence_factors).map(([factor, weight]) => (
              <div key={factor} className="flex items-center gap-2">
                <span className="text-gray-400 text-xs w-32 shrink-0 truncate" title={factor}>{factor}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (weight * 100))}%` }}
                  />
                </div>
                <span className="text-gray-300 text-xs w-10 text-right">{(weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function PredictionHistoryTable({ predictions }: { predictions: Prediction[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
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
            <>
              <tr
                key={p.id}
                className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors cursor-pointer"
                onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
              >
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
              {selectedId === p.id && (
                <tr key={`${p.id}-detail`} className="border-b border-gray-800">
                  <td colSpan={8} className="bg-gray-950 border-l-2 border-blue-500">
                    <DetailPanel id={p.id} reasoning={p.reasoning ?? ''} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
