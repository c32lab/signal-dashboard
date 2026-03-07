import type { BacktestResult, BacktestSummary, SymbolBacktest } from '../types/backtest'

/* eslint-disable @typescript-eslint/no-explicit-any */

export function isFormatB(obj: any): boolean {
  return (
    obj &&
    obj.meta &&
    obj.configs &&
    Object.values(obj.configs).some((c: any) => c?.overall_1h)
  )
}

export function convertFormatB(raw: any): BacktestResult {
  const meta = raw.meta ?? {}
  const configs: Record<string, { weights: Record<string, number>; description: string }> = {}
  const summary: BacktestSummary[] = []
  const bySymbol: Record<string, SymbolBacktest[]> = {}

  for (const [configName, configData] of Object.entries(raw.configs ?? {})) {
    const cd = configData as any

    configs[configName] = {
      weights: {},
      description: cd?.description ?? '',
    }

    const o = cd?.overall_1h
    if (o) {
      const count = Number(o.count ?? 0)
      const winRate = Number(o.win_rate ?? 0)
      const winCount = Math.round(count * winRate / 100)
      summary.push({
        config: configName,
        total_trades: count,
        win_rate_pct: winRate,
        total_pnl_pct: Number(o.total_pnl ?? 0),
        sharpe: Number(o.sharpe ?? 0),
        max_drawdown_pct: Number(o.max_drawdown ?? 0),
        signal_count: count,
        win_count: winCount,
        loss_count: count - winCount,
      })
    }

    const symbols: any[] = cd?.by_symbol_1h ?? []
    for (const s of symbols) {
      const label = String(s?.label ?? '')
      if (!label) continue
      if (!bySymbol[label]) bySymbol[label] = []
      bySymbol[label].push({
        config: configName,
        trades: Number(s?.count ?? 0),
        win_rate_pct: Number(s?.win_rate ?? 0),
        total_pnl_pct: Number(s?.total_pnl ?? 0),
        sharpe: Number(s?.sharpe ?? 0),
        max_drawdown_pct: Number(s?.max_drawdown ?? 0),
        long_count: Number(s?.long_count ?? 0),
        long_pnl_pct: Number(s?.long_pnl ?? 0),
        short_count: Number(s?.short_count ?? 0),
        short_pnl_pct: Number(s?.short_pnl ?? 0),
      })
    }
  }

  const byRegime: Record<string, BacktestSummary[]> = {}
  for (const [configName, configData] of Object.entries(raw.configs ?? {})) {
    const cd = configData as any
    const regimeData: Record<string, any> = cd?.by_regime_1h ?? {}
    for (const [regimeName, r] of Object.entries(regimeData)) {
      if (!byRegime[regimeName]) byRegime[regimeName] = []
      const count = Number(r?.count ?? 0)
      const winRate = Number(r?.win_rate ?? 0)
      const winCount = Math.round(count * winRate / 100)
      byRegime[regimeName].push({
        config: configName,
        total_trades: count,
        win_rate_pct: winRate,
        total_pnl_pct: Number(r?.total_pnl ?? 0),
        sharpe: Number(r?.sharpe ?? 0),
        max_drawdown_pct: Number(r?.max_drawdown ?? 0),
        signal_count: count,
        win_count: winCount,
        loss_count: count - winCount,
        regime: regimeName,
      })
    }
  }

  return {
    generated_at: String(meta.generated_at ?? ''),
    data_range: {
      start: String(meta.start_date ?? ''),
      end: String(meta.end_date ?? ''),
    },
    configs,
    summary,
    by_symbol: bySymbol,
    pnl_curve: {},
    ...(Object.keys(byRegime).length > 0 ? { by_regime: byRegime } : {}),
  }
}
