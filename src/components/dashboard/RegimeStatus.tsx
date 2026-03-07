import { useSignalsLatest } from '../../hooks/useApi'
import type { RegimeInfo } from '../../types'

interface SymbolRegime {
  symbol: string
  regime: RegimeInfo
  timestamp: string
}

export function RegimeStatus() {
  const { data: signals } = useSignalsLatest()

  if (!signals || signals.length === 0) return null

  // Parse regime from raw_json, deduplicate by symbol (keep latest)
  const regimeMap = new Map<string, SymbolRegime>()

  for (const sig of signals) {
    if (!sig.raw_json) continue
    try {
      const raw = JSON.parse(sig.raw_json)
      const regimeData = raw?.market_snapshot?.regime as RegimeInfo | undefined
      if (!regimeData?.regime) continue

      const existing = regimeMap.get(sig.symbol)
      if (!existing || sig.timestamp > existing.timestamp) {
        regimeMap.set(sig.symbol, {
          symbol: sig.symbol,
          regime: regimeData,
          timestamp: sig.timestamp,
        })
      }
    } catch {
      // skip unparseable raw_json
    }
  }

  const entries = Array.from(regimeMap.values()).sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  )

  if (entries.length === 0) return null

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-200">Market Regime</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {entries.map(({ symbol, regime }) => {
            const isTrending = regime.regime === 'trending'
            const badgeClasses = isTrending
              ? 'bg-green-900/50 text-green-400 border-green-700'
              : 'bg-yellow-900/50 text-yellow-400 border-yellow-700'

            return (
              <div
                key={symbol}
                className="bg-gray-800/50 rounded-lg border border-gray-700 p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-semibold text-blue-300">
                    {symbol}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${badgeClasses}`}
                  >
                    {regime.regime.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>
                    ADX{' '}
                    <span className="text-gray-200 font-mono">
                      {regime.regime_indicators.adx.toFixed(1)}
                    </span>
                  </span>
                  <span>
                    Conf{' '}
                    <span className="text-gray-200 font-mono">
                      {(regime.regime_confidence * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
                {regime.regime_advice && (
                  <p
                    className="text-xs text-gray-500 truncate"
                    title={regime.regime_advice}
                  >
                    {regime.regime_advice}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
