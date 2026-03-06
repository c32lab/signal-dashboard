import useSWR from 'swr'
import {
  usePrediction,
  usePredictHealth,
  useTrends,
  useIndustryChain,
  usePredictAccuracy,
} from '../hooks/usePredictApi'
import { predictApi } from '../api/predict'
import SectionErrorBoundary from '../components/SectionErrorBoundary'
import type { Trend } from '../types/predict'
import {
  MacroCard,
  PredictionTable,
  PredictionHistoryTable,
  EventTable,
  PatternCard,
  MacroHistoryChart,
  TrendsSection,
  IndustryChainSection,
  AccuracyAndValidationsSection,
  DerivativesOverviewSection,
  PredictHealthHeader,
} from '../components/predict'

export default function PredictDashboard() {
  const { data, error, isLoading } = usePrediction()
  const { data: healthData } = usePredictHealth()
  // Fetch all predictions without status filter for the history table
  const { data: allPredictionsData, isLoading: histLoading } = useSWR(
    'predict/predictions/all',
    () => predictApi.predictions({ limit: 50 }),
    { refreshInterval: 30_000 }
  )
  const { data: accuracyData } = usePredictAccuracy()
  const { data: trendsData, isLoading: trendsLoading } = useTrends()
  const { data: chainData, isLoading: chainLoading } = useIndustryChain()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Loading predictions…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load: {error.message}
      </div>
    )
  }

  if (!data) return null

  const { macro, event_kb, predictions, macro_history, accuracy, recent_validations } = data
  const activeList = predictions?.active ?? []
  const events = event_kb?.events ?? []
  const patterns = event_kb?.patterns ?? []

  const trends = Array.isArray(trendsData) ? trendsData : (trendsData as unknown as { trends?: Trend[] })?.trends ?? []
  const chainNodes = chainData?.nodes ?? []
  const chainEdges = chainData?.edges ?? []

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Service Health Header */}
      <SectionErrorBoundary title="Predict Health">
        <PredictHealthHeader
          serviceOk={healthData?.status === 'ok'}
          activeCount={activeList.length}
          eventCount={events.length}
          macroScore={macro?.score ?? null}
          accuracy={accuracyData}
        />
      </SectionErrorBoundary>

      {/* Macro Score Cards */}
      <SectionErrorBoundary title="Macro Overview">
      <section>
        <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Macro Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MacroCard
            label="Macro Score"
            value={macro.score != null ? macro.score.toFixed(1) : '—'}
            sub="0–10"
          />
          <MacroCard
            label="Fear & Greed"
            value={macro.fear_greed != null ? String(macro.fear_greed) : '—'}
            sub={macro.fear_greed_trend}
          />
          <MacroCard
            label="ETF Flow 1D"
            value={macro.etf_flow_1d != null ? `$${(macro.etf_flow_1d / 1e6).toFixed(0)}M` : '—'}
            sub={macro.etf_flow_5d != null ? `5D: $${(macro.etf_flow_5d / 1e6).toFixed(0)}M` : undefined}
          />
          <MacroCard
            label="Volume Ratio"
            value={macro.volume_ratio != null ? macro.volume_ratio.toFixed(2) : '—'}
          />
          <MacroCard
            label="Funding Rate"
            value={macro.funding_rate != null ? `${(macro.funding_rate * 100).toFixed(3)}%` : '—'}
            sub={macro.funding_rate_avg != null ? `Avg: ${(macro.funding_rate_avg * 100).toFixed(3)}%` : undefined}
          />
        </div>
      </section>
      </SectionErrorBoundary>

      {/* Active Predictions */}
      <SectionErrorBoundary title="Active Predictions">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Active Predictions
            <span className="ml-2 text-xs text-gray-500">({activeList.length})</span>
          </h2>
        </div>
        <div className="p-2">
          {activeList.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No active predictions</p>
          ) : (
            <PredictionTable predictions={activeList} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* Event KB */}
      <SectionErrorBoundary title="Event Library">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Event Library
            <span className="ml-2 text-xs text-gray-500">(latest 20)</span>
          </h2>
        </div>
        <div className="p-2">
          {events.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No events</p>
          ) : (
            <EventTable events={events} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* Patterns + Chart */}
      <SectionErrorBoundary title="Patterns & Macro Chart">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patterns */}
        <section>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Event Patterns</h2>
          {patterns.length === 0 ? (
            <p className="text-gray-600 text-sm">No patterns</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {patterns.map((p) => (
                <PatternCard key={p.id} pattern={p} />
              ))}
            </div>
          )}
        </section>

        {/* Macro History Chart */}
        <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Macro History</h2>
          {macro_history?.length > 0 ? (
            <MacroHistoryChart snapshots={macro_history} />
          ) : (
            <p className="text-center text-gray-600 text-sm py-16">No history data</p>
          )}
        </section>
      </div>
      </SectionErrorBoundary>

      {/* ── Section A: Prediction History ──────────────────────────────────── */}
      <SectionErrorBoundary title="Prediction History">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Prediction History
            <span className="ml-2 text-xs text-gray-500">
              {histLoading ? 'loading…' : `(${(allPredictionsData?.predictions ?? []).length})`}
            </span>
          </h2>
        </div>
        <div className="p-2">
          {histLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : !allPredictionsData?.predictions || allPredictionsData.predictions.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No prediction history</p>
          ) : (
            <PredictionHistoryTable predictions={allPredictionsData.predictions} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ── Section B: Trend Discovery ─────────────────────────────────────── */}
      <SectionErrorBoundary title="Trend Discovery">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Trend Discovery
            {!trendsLoading && trends.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">({trends.length})</span>
            )}
          </h2>
        </div>
        <div className="p-4">
          {trendsLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : (
            <TrendsSection trends={trends} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ── Sections D+E: Prediction Accuracy + Validations ──────────────── */}
      <SectionErrorBoundary title="Prediction Accuracy">
      <AccuracyAndValidationsSection
        accuracy={accuracyData?.accuracy ?? accuracy ?? {}}
        validations={accuracyData?.recent_validations ?? recent_validations ?? []}
      />
      </SectionErrorBoundary>

      {/* ── Section C: Industry Chain Visualization ───────────────────────── */}
      <SectionErrorBoundary title="Industry Chain">
      <section className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">
            Industry Chain
            {!chainLoading && chainNodes.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                {chainNodes.length} nodes · {chainEdges.length} edges
              </span>
            )}
          </h2>
        </div>
        <div className="p-4">
          {chainLoading ? (
            <p className="text-center text-gray-600 py-8 text-sm">Loading…</p>
          ) : chainNodes.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm">No industry chain data</p>
          ) : (
            <IndustryChainSection nodes={chainNodes} edges={chainEdges} />
          )}
        </div>
      </section>
      </SectionErrorBoundary>

      {/* ── Section F: Derivatives Overview ───────────────────────────────── */}
      <SectionErrorBoundary title="Derivatives Overview">
      <DerivativesOverviewSection />
      </SectionErrorBoundary>
    </div>
  )
}
