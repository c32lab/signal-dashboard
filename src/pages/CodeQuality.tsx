import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { mockCodeQuality } from '../mocks/codeQuality'
import type { CodeQualityModule } from '../types/codeQuality'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#111827', border: '1px solid #374151', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#9ca3af' },
  itemStyle: { color: '#e5e7eb' },
}

function scoreColor(score: number, target: number): string {
  if (score >= target) return '#34d399'
  if (score >= 6) return '#fbbf24'
  return '#f87171'
}

function complexityBadge(complexity: CodeQualityModule['complexity']) {
  const map = {
    low: 'bg-green-900 text-green-300',
    medium: 'bg-yellow-900 text-yellow-300',
    high: 'bg-red-900 text-red-300',
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${map[complexity]}`}>
      {complexity}
    </span>
  )
}

// ── Section A: Score Overview ─────────────────────────────────────────────────

function ScoreOverview() {
  const { overall_score, target_score } = mockCodeQuality
  const pct = Math.min((overall_score / 10) * 100, 100)
  const color = scoreColor(overall_score, target_score)
  const diff = (overall_score - target_score).toFixed(1)
  const diffStr = overall_score >= target_score ? `+${diff}` : diff

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-400 mb-4">Score Overview</h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Big score */}
        <div className="text-center">
          <div className="text-6xl font-bold" style={{ color }}>{overall_score.toFixed(1)}</div>
          <div className="text-gray-500 text-sm mt-1">/ {target_score.toFixed(1)} target</div>
          <div className="mt-1 text-sm font-semibold" style={{ color }}>
            {diffStr} vs target
          </div>
        </div>
        {/* Progress bar */}
        <div className="flex-1 w-full">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4 relative">
            <div
              className="h-4 rounded-full transition-all"
              style={{ width: `${pct}%`, background: color }}
            />
            {/* target marker */}
            <div
              className="absolute top-0 h-4 w-0.5 bg-gray-400"
              style={{ left: `${(target_score / 10) * 100}%` }}
              title={`Target: ${target_score}`}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-500">Current: <span className="font-semibold" style={{ color }}>{overall_score}</span></span>
            <span className="text-gray-500">Target: <span className="font-semibold text-gray-300">{target_score}</span></span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Section B: Score Trend ────────────────────────────────────────────────────

function ScoreTrend() {
  const { history, target_score } = mockCodeQuality

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-400 mb-4">Score Trend</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={history} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(d) => d.slice(5)} // MM-DD
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(v: number | undefined) => [(v ?? 0).toFixed(1), 'Score']}
          />
          <ReferenceLine
            y={target_score}
            stroke="#6b7280"
            strokeDasharray="4 3"
            label={{ value: `Target ${target_score}`, position: 'insideTopRight', fill: '#9ca3af', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 4, fill: '#60a5fa' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}

// ── Section C: Key Metrics ────────────────────────────────────────────────────

function KeyMetrics() {
  const { metrics } = mockCodeQuality
  const cards = [
    {
      label: 'Broad Except',
      value: metrics.broad_except_count,
      subtitle: 'occurrences',
      color: 'text-red-400',
      bg: 'bg-red-950 border-red-900',
    },
    {
      label: 'Untested Collectors',
      value: metrics.untested_collectors,
      subtitle: 'collectors',
      color: 'text-yellow-400',
      bg: 'bg-yellow-950 border-yellow-900',
    },
    {
      label: 'Long Functions',
      value: metrics.long_functions,
      subtitle: '>50 lines',
      color: 'text-yellow-400',
      bg: 'bg-yellow-950 border-yellow-900',
    },
    {
      label: 'Test Coverage',
      value: `${metrics.test_files}/${metrics.total_files}`,
      subtitle: 'files covered',
      color: 'text-green-400',
      bg: 'bg-green-950 border-green-900',
    },
  ]

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-400 mb-4">Key Metrics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-lg border p-3 ${c.bg}`}>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-600">{c.subtitle}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-gray-500">
        <span>Total files: <span className="text-gray-300">{metrics.total_files}</span></span>
        <span>Total lines: <span className="text-gray-300">{metrics.total_lines.toLocaleString()}</span></span>
      </div>
    </section>
  )
}

// ── Section D: Module Health ──────────────────────────────────────────────────

function ModuleHealth() {
  const { modules } = mockCodeQuality

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-400 mb-4">Module Health</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-800">
              <th className="text-left pb-2 pr-4">Module</th>
              <th className="text-right pb-2 pr-4">Lines</th>
              <th className="text-left pb-2 pr-4">Complexity</th>
              <th className="text-center pb-2 pr-4">Tests</th>
              <th className="text-left pb-2">Issues</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr key={mod.name} className="border-b border-gray-800 last:border-0">
                <td className="py-2 pr-4 font-mono text-xs text-gray-200 whitespace-nowrap">{mod.name}</td>
                <td className="py-2 pr-4 text-right text-gray-400">{mod.lines}</td>
                <td className="py-2 pr-4">{complexityBadge(mod.complexity)}</td>
                <td className="py-2 pr-4 text-center">
                  {mod.test_coverage ? (
                    <span className="text-green-400">&#10003;</span>
                  ) : (
                    <span className="text-red-400">&#10007;</span>
                  )}
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {mod.issues.length === 0 ? (
                      <span className="text-gray-600 text-xs">—</span>
                    ) : (
                      mod.issues.map((issue) => (
                        <span
                          key={issue}
                          className="inline-block bg-gray-800 text-gray-300 text-xs px-1.5 py-0.5 rounded"
                        >
                          {issue}
                        </span>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ── Section E: Issues Summary ─────────────────────────────────────────────────

function IssuesSummary() {
  const { modules } = mockCodeQuality

  // Collect all issues with their module source
  const allIssues: { issue: string; module: string }[] = []
  for (const mod of modules) {
    for (const issue of mod.issues) {
      allIssues.push({ issue, module: mod.name })
    }
  }

  // Group by issue text and count occurrences
  const issueCount = new Map<string, string[]>()
  for (const { issue, module } of allIssues) {
    const existing = issueCount.get(issue) ?? []
    existing.push(module)
    issueCount.set(issue, existing)
  }

  // Sort by frequency desc
  const sorted = [...issueCount.entries()].sort((a, b) => b[1].length - a[1].length)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-400 mb-4">Issues Summary</h2>
      {sorted.length === 0 ? (
        <p className="text-gray-600 text-sm">No issues found.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(([issue, mods]) => (
            <div key={issue} className="flex items-start gap-3 bg-gray-800 rounded-lg p-3">
              <span className="flex-shrink-0 mt-0.5 text-yellow-400 text-sm font-bold">
                x{mods.length}
              </span>
              <div>
                <div className="text-sm text-gray-200">{issue}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mods.map((m) => (
                    <span key={m} className="text-xs font-mono text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CodeQuality() {
  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg px-4 py-3 text-sm text-yellow-300">
        ⚠️ Showing mock data — connect QA audit API for live data
      </div>
      <ScoreOverview />
      <ScoreTrend />
      <KeyMetrics />
      <ModuleHealth />
      <IssuesSummary />
    </div>
  )
}
