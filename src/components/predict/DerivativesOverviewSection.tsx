import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  useOpenInterest,
  useLongShortRatio,
  useTakerVolume,
} from '../../hooks/usePredictApi'
import type { OpenInterestPoint, LongShortRatioPoint, TakerVolumePoint } from '../../types/predict'
import { formatChartTime } from '../../utils/format'

const DERIV_TOOLTIP_STYLE = { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 }

function fmtTime(ts: number): string {
  return formatChartTime(ts)
}

function fmtOIValue(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`
  return `$${v.toLocaleString('en-US')}`
}

function OIChart({ data, isLoading }: { data: OpenInterestPoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  const chartData = sorted.map((p) => ({ time: fmtTime(p.timestamp), value: p.sum_open_interest_value }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Open Interest</h3>
        {latest && <span className="text-xs font-mono text-blue-300">{fmtOIValue(latest.sum_open_interest_value)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="oiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={fmtOIValue}
            />
            <Tooltip
              contentStyle={DERIV_TOOLTIP_STYLE}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(v: number | undefined) => [fmtOIValue(v ?? 0), 'OI Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#oiGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function LSRChart({ data, isLoading }: { data: LongShortRatioPoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  // long_account/short_account: decimal_0_1 → ×100 for display
  const chartData = sorted.map((p) => ({
    time: fmtTime(p.timestamp),
    long: parseFloat((p.long_account * 100).toFixed(1)),   // decimal_0_1 → ×100
    short: parseFloat((p.short_account * 100).toFixed(1)), // decimal_0_1 → ×100
  }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Long/Short Ratio</h3>
        {latest && <span className="text-xs font-mono text-gray-300">{latest.long_short_ratio.toFixed(2)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={DERIV_TOOLTIP_STYLE}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
              formatter={(v: number | undefined, name: string | undefined) => [`${(v ?? 0).toFixed(1)}%`, name ?? '']}
            />
            <Bar dataKey="long" stackId="a" fill="#22c55e" name="Long %" />
            <Bar dataKey="short" stackId="a" fill="#ef4444" name="Short %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TakerVolumeChart({ data, isLoading }: { data: TakerVolumePoint[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">Loading...</div>
  }
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">No data available</div>
  }
  const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)
  const latest = sorted[sorted.length - 1]
  const chartData = sorted.map((p) => ({
    time: fmtTime(p.timestamp),
    buy: p.buy_vol,
    sell: p.sell_vol,
  }))
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Taker Buy/Sell Volume</h3>
        {latest && <span className="text-xs font-mono text-gray-300">{latest.buy_sell_ratio.toFixed(3)}</span>}
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : String(v)}
            />
            <Tooltip
              contentStyle={DERIV_TOOLTIP_STYLE}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#e5e7eb' }}
            />
            <Bar dataKey="buy" fill="#22c55e" name="Buy Vol" />
            <Bar dataKey="sell" fill="#ef4444" name="Sell Vol" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const DERIV_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']

export function DerivativesOverviewSection() {
  const [derivSymbol, setDerivSymbol] = useState('BTC/USDT')
  const { data: oiData, isLoading: oiLoading } = useOpenInterest(derivSymbol, 24)
  const { data: lsrData, isLoading: lsrLoading } = useLongShortRatio(derivSymbol, 24)
  const { data: tvData, isLoading: tvLoading } = useTakerVolume(derivSymbol, 24)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-200">Derivatives Overview</h2>
        <div className="flex gap-1">
          {DERIV_SYMBOLS.map((s) => (
            <button
              key={s}
              onClick={() => setDerivSymbol(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                derivSymbol === s
                  ? 'bg-blue-700 text-blue-100'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s.replace('/USDT', '')}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OIChart data={oiData} isLoading={oiLoading} />
        <LSRChart data={lsrData} isLoading={lsrLoading} />
        <TakerVolumeChart data={tvData} isLoading={tvLoading} />
      </div>
    </section>
  )
}
