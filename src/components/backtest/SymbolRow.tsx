import { useState } from 'react'
import type { SymbolBacktest } from '../../types/backtest'
import { CONFIG_COLORS } from './configColors'
import { pct } from './backtestUtils'

interface SymbolRowProps {
  symbol: string
  rows: SymbolBacktest[]
}

export default function SymbolRow({ symbol, rows }: SymbolRowProps) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="font-mono text-sm text-gray-100">{symbol}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-t border-gray-800 bg-gray-950">
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Config</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Trades</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Win Rate</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">PnL%</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Sharpe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hasDirectional = (r.long_count ?? 0) > 0 || (r.short_count ?? 0) > 0
                return (
                  <tr key={r.config} className="border-t border-gray-800 bg-gray-900">
                    <td className="px-4 py-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: CONFIG_COLORS[r.config] ?? '#9ca3af' }}
                      />
                      <span className="text-gray-200">{r.config}</span>
                      {hasDirectional && (
                        <div className="mt-1.5 ml-4 space-y-0.5 text-[10px]">
                          <div className="flex gap-3">
                            <span className="text-green-400">LONG</span>
                            <span className="text-gray-400">×{r.long_count ?? 0}</span>
                            <span className={((r.long_pnl_pct ?? 0) >= 0) ? 'text-green-400' : 'text-red-400'}>
                              {pct(r.long_pnl_pct ?? 0)}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-red-400">SHORT</span>
                            <span className="text-gray-400">×{r.short_count ?? 0}</span>
                            <span className={((r.short_pnl_pct ?? 0) >= 0) ? 'text-green-400' : 'text-red-400'}>
                              {pct(r.short_pnl_pct ?? 0)}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-300">{r.trades}</td>
                    <td className={`px-4 py-2 text-right font-mono ${(r.win_rate_pct ?? 0) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                      {pct(r.win_rate_pct ?? 0)}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${r.total_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pct(r.total_pnl_pct)}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-300">{(r.sharpe ?? 0).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
