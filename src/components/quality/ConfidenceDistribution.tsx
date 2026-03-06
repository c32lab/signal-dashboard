import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ConfidenceData } from '../../types'

const BUCKET_ORDER = ['minimal_0-20', 'very_low_20-30', 'low_30-40', 'medium_40-50', 'high_50+']
const BUCKET_LABELS: Record<string, string> = {
  'minimal_0-20': '0-20%',
  'very_low_20-30': '20-30%',
  'low_30-40': '30-40%',
  'medium_40-50': '40-50%',
  'high_50+': '50%+',
}

const ACTION_COLORS: Record<string, string> = {
  LONG: '#34d399',
  SHORT: '#f87171',
  HOLD: '#6b7280',
}

export function ConfidenceDistribution({ data }: { data: ConfidenceData }) {
  const buckets = useMemo(() => data.confidence_buckets ?? [], [data])

  const chartData = useMemo(() => {
    const map = new Map<string, Record<string, number | string>>()
    for (const name of BUCKET_ORDER) {
      map.set(name, { bucket: BUCKET_LABELS[name] ?? name, LONG: 0, SHORT: 0, HOLD: 0 })
    }
    for (const b of buckets) {
      const row = map.get(b.bucket)
      if (row && (b.action === 'LONG' || b.action === 'SHORT' || b.action === 'HOLD')) {
        row[b.action] = (row[b.action] as number) + b.cnt
      }
    }
    return BUCKET_ORDER.map((name) => map.get(name)!).filter(Boolean)
  }, [buckets])

  const total = useMemo(() => buckets.reduce((s, b) => s + b.cnt, 0), [buckets])

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-200">Confidence Distribution</h2>
        <span className="text-xs text-gray-500">{total} decisions</span>
      </div>
      {chartData.length === 0 ? (
        <p className="text-center text-gray-600 py-8 text-sm">No data</p>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="bucket"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              <Bar dataKey="LONG" stackId="a" fill={ACTION_COLORS.LONG} radius={[0, 0, 0, 0]} />
              <Bar dataKey="SHORT" stackId="a" fill={ACTION_COLORS.SHORT} radius={[0, 0, 0, 0]} />
              <Bar dataKey="HOLD" stackId="a" fill={ACTION_COLORS.HOLD} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
