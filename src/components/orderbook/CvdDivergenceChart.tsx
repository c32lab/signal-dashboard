import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { useOrderbookCvd } from '../../hooks/useApi'
import type { CvdApiResponse } from './types'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function DivergenceBadge({ type }: { type: string }) {
  if (type === 'bullish_div') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 border border-green-800/50 font-medium">
        BULLISH DIV
      </span>
    )
  }
  if (type === 'bearish_div') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/50 font-medium">
        BEARISH DIV
      </span>
    )
  }
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800/60 text-gray-500 border border-gray-700/50 font-medium">
      NO DIV
    </span>
  )
}

function LiveStats({ data }: { data: CvdApiResponse }) {
  const score = typeof data.divergence_score === 'number' ? data.divergence_score : 0
  const scoreColor =
    score > 0.3
      ? 'text-green-400'
      : score < -0.3
        ? 'text-red-400'
        : 'text-gray-300'

  return (
    <div className="flex items-center gap-4 mb-3 text-xs">
      <span className="text-blue-400">
        CVD 30m{' '}
        {typeof data.cvd_30m === 'number' ? data.cvd_30m.toFixed(1) : '—'}
      </span>
      <span className="text-cyan-400">
        CVD 5m{' '}
        {typeof data.cvd_5m === 'number' ? data.cvd_5m.toFixed(1) : '—'}
      </span>
      <span className={scoreColor}>
        Div{' '}
        {typeof data.divergence_score === 'number'
          ? data.divergence_score.toFixed(3)
          : '—'}
      </span>
      <DivergenceBadge type={data.divergence_type ?? 'none'} />
    </div>
  )
}

export default function CvdDivergenceChart() {
  const { data, error, isLoading } = useOrderbookCvd('BTCUSDT')
  const isLive = data && !error && typeof data.cvd_30m === 'number'

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-200">CVD Divergence</h3>
      </div>

      {isLoading ? (
        <div className="h-[240px] bg-gray-800/50 rounded-lg animate-pulse" />
      ) : !isLive ? (
        <p className="text-gray-500 text-xs py-8 text-center">
          CVD data not available — waiting for orderbook collector
        </p>
      ) : (
        <>
          <LiveStats data={data} />
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart
              data={[{
                time: formatTime(new Date().toISOString()),
                cvd_trend: data.cvd_trend,
                price_trend: data.price_trend,
                divergence_score: data.divergence_score,
              }]}
              margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                interval={9}
                tickLine={false}
              />
              <YAxis
                yAxisId="cvd"
                domain={[-1, 1]}
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                domain={[-1, 1]}
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#D1D5DB' }}
                formatter={(value, name) => {
                  const v = Number(value)
                  if (name === 'cvd_trend') return [v.toFixed(3), 'CVD Trend']
                  if (name === 'price_trend') return [v.toFixed(3), 'Price Trend']
                  return [v.toFixed(3), 'Divergence']
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }}
                formatter={(value: string) => {
                  if (value === 'cvd_trend') return 'CVD Trend'
                  if (value === 'price_trend') return 'Price Trend'
                  return value
                }}
              />
              <Line
                yAxisId="cvd"
                dataKey="cvd_trend"
                stroke="#60A5FA"
                strokeWidth={1.5}
                dot={false}
                type="monotone"
              />
              <Line
                yAxisId="price"
                dataKey="price_trend"
                stroke="#FBBF24"
                strokeWidth={1.5}
                dot={false}
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  )
}
