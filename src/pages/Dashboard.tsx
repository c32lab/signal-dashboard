import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import KPIPanel from '../components/KPIPanel'
import LiveSignalFeed from '../components/LiveSignalFeed'
import SignalCards from '../components/SignalCards'
import CombinerWeights from '../components/CombinerWeights'
import DecisionTable from '../components/DecisionTable'
import LastUpdated from '../components/LastUpdated'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import { useOverview, useBias, useCollectorHealth, useStatus } from '../hooks/useApi'
import type { BiasAlert, BiasResponse, CollectorHealthResponse, StatusResponse } from '../types'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
}

// ── Alerts Panel ──────────────────────────────────────────────────────────────

function AlertsPanel({ data }: { data: StatusResponse }) {
  const alerts = data.bias_alerts ?? []
  const dupRatio = data.duplicate_ratio ?? 0
  const disabledSymbols = data.disabled_symbols ?? []

  const hasAlerts = alerts.length > 0 || dupRatio > 0.5 || disabledSymbols.length > 0
  if (!hasAlerts) return null

  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex flex-col gap-2">
      {alerts.map((alert: BiasAlert, i: number) => {
        const isHigh = alert.bias_score > 0.7
        const isMed = alert.bias_score > 0.5
        const borderColor = isHigh ? 'border-red-500' : isMed ? 'border-yellow-500' : 'border-gray-600'
        const bgColor = isHigh ? 'bg-red-900/20' : isMed ? 'bg-yellow-900/20' : 'bg-gray-800/40'
        const textColor = isHigh ? 'text-red-300' : isMed ? 'text-yellow-300' : 'text-gray-400'
        const barColor = isHigh ? 'bg-red-500' : isMed ? 'bg-yellow-500' : 'bg-gray-500'
        return (
          <div key={i} className={`border-l-4 ${borderColor} ${bgColor} rounded px-3 py-2`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-200">{alert.collector}</span>
              <span className={`text-xs font-mono ${textColor}`}>{alert.bias_score.toFixed(3)}</span>
            </div>
            <p className="text-xs text-gray-400 mb-1.5">{alert.alert}</p>
            <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full`}
                style={{ width: `${Math.min(alert.bias_score * 100, 100)}%` }}
              />
            </div>
          </div>
        )
      })}
      {dupRatio > 0.5 && (
        <div className="border-l-4 border-yellow-500 bg-yellow-900/20 rounded px-3 py-2">
          <p className="text-xs font-semibold text-yellow-300">
            High duplicate ratio: {(dupRatio * 100).toFixed(1)}%
          </p>
        </div>
      )}
      {disabledSymbols.length > 0 && (
        <div className="border-l-4 border-yellow-500 bg-yellow-900/20 rounded px-3 py-2">
          <p className="text-xs font-semibold text-yellow-300">
            Symbols disabled: {disabledSymbols.join(', ')}
          </p>
        </div>
      )}
    </section>
  )
}

// ── Collector Status ──────────────────────────────────────────────────────────

function CollectorStatus({ data }: { data: CollectorHealthResponse }) {
  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-3">Collector Status</h2>
      <div className="flex flex-wrap gap-2">
        {data.collectors.map((c) => {
          const pillColor = c.is_disabled
            ? 'bg-red-900/60 border-red-700 text-red-300'
            : c.is_degraded
            ? 'bg-yellow-900/60 border-yellow-700 text-yellow-300'
            : 'bg-green-900/40 border-green-800 text-green-400'
          return (
            <span
              key={c.name}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${pillColor}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  c.is_disabled ? 'bg-red-400' : c.is_degraded ? 'bg-yellow-400' : 'bg-green-400'
                }`}
              />
              {c.name}
              {c.error_count > 0 && (
                <span className="opacity-75">({c.error_count} err)</span>
              )}
            </span>
          )
        })}
      </div>
    </section>
  )
}

// ── Source Bias ───────────────────────────────────────────────────────────────

function biasColor(score: number): string {
  if (score > 0.05) return '#34d399'  // green-400 = long bias
  if (score < -0.05) return '#f87171' // red-400 = short bias
  return '#6b7280'                    // gray-500 = neutral
}

function SourceBias({ data }: { data: BiasResponse }) {
  const entries = Object.entries(data.collectors ?? {}).map(([name, c]) => ({
    name,
    bias_score: c.bias_score,
  })).sort((a, b) => b.bias_score - a.bias_score)

  const overall = data.overall ?? (() => {
    const cols = Object.values(data.collectors ?? {})
    const total = cols.reduce((s, c) => s + c.total_signals, 0)
    const long_count = cols.reduce((s, c) => s + c.long_count, 0)
    const short_count = cols.reduce((s, c) => s + c.short_count, 0)
    const neutral_count = cols.reduce((s, c) => s + c.neutral_count, 0)
    return {
      long_pct: total ? (long_count / total) * 100 : 0,
      short_pct: total ? (short_count / total) * 100 : 0,
      neutral_pct: total ? (neutral_count / total) * 100 : 0,
      bias_score: total ? (long_count - short_count) / total : 0,
    }
  })()

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h2 className="text-sm font-semibold text-gray-200">Source Bias</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500">Overall:</span>
          <span
            className="font-mono font-bold"
            style={{ color: biasColor(overall.bias_score) }}
          >
            {overall.bias_score >= 0 ? '+' : ''}{overall.bias_score.toFixed(3)}
          </span>
          <span className="text-gray-600 hidden sm:inline">
            ({overall.long_pct.toFixed(1)}% L / {overall.short_pct.toFixed(1)}% S / {overall.neutral_pct.toFixed(1)}% N)
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(140, entries.length * 36)}>
        <BarChart
          data={entries}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 4, left: 100 }}
        >
          <XAxis
            type="number"
            domain={[-1, 1]}
            tickFormatter={(v: number) => v.toFixed(1)}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            formatter={(value: number | undefined) => [
              `${(value ?? 0) >= 0 ? '+' : ''}${Number(value ?? 0).toFixed(3)}`,
              'Bias Score',
            ]}
            {...TOOLTIP_STYLE}
          />
          <ReferenceLine x={0} stroke="#374151" strokeWidth={1} />
          <Bar dataKey="bias_score" name="Bias Score" radius={[0, 4, 4, 0]}>
            {entries.map((entry) => (
              <Cell key={entry.name} fill={biasColor(entry.bias_score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data } = useOverview()
  const biasRes = useBias()
  const collectorRes = useCollectorHealth()
  const statusRes = useStatus()
  const [lastUpdated, setLastUpdated] = useState<Date>()

  useEffect(() => {
    if (data) setLastUpdated(new Date())
  }, [data])

  const biasData = biasRes.data
  const collectorData = collectorRes.data
  const statusData = statusRes.data

  return (
    <div className="flex flex-col gap-4 sm:gap-8 py-2 sm:py-6">
      <div className="px-2 sm:px-6">
        <LastUpdated timestamp={lastUpdated} />
      </div>
      {statusData && (
        <div className="px-2 sm:px-6">
          <AlertsPanel data={statusData} />
        </div>
      )}
      <div className="px-2 sm:px-6">
        <SectionErrorBoundary title="Live Signal Feed">
          <LiveSignalFeed />
        </SectionErrorBoundary>
      </div>
      <SectionErrorBoundary title="KPI Panel">
        <KPIPanel />
      </SectionErrorBoundary>
      {collectorData && (
        <div className="px-2 sm:px-6">
          <SectionErrorBoundary title="Collector Status">
            <CollectorStatus data={collectorData} />
          </SectionErrorBoundary>
        </div>
      )}
      <div className="px-2 sm:px-6">
        <SectionErrorBoundary title="Combiner Weights">
          <CombinerWeights />
        </SectionErrorBoundary>
      </div>
      {biasData && (
        <div className="px-2 sm:px-6">
          <SectionErrorBoundary title="Source Bias">
            <SourceBias data={biasData} />
          </SectionErrorBoundary>
        </div>
      )}
      <SectionErrorBoundary title="Signal Cards">
        <SignalCards />
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Decision History">
        <DecisionTable />
      </SectionErrorBoundary>
    </div>
  )
}
