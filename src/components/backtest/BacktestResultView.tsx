import type { BacktestResult } from '../../types/backtest'
import SectionErrorBoundary from '../SectionErrorBoundary'
import { ConfigWeightsDetail, ParamCompareTable, RegimeFilter, RegimeMiniCard, SummaryCard, PnlCompareChart, WinRateCompareChart, WeightHeatmap, PerformanceScatter, DirectionBreakdown } from './'
import TradeDistributionChart from './TradeDistributionChart'
import ParamSweepHeatmap from './ParamSweepHeatmap'
import RadarCompareChart from './RadarCompareChart'
import SensitivityAnalysis from './SensitivityAnalysis'
import { bestConfigName } from './backtestUtils'
import { useBacktestFilter } from './useBacktestFilter'
import BacktestHeader from './BacktestHeader'
import SymbolTableSection from './SymbolTableSection'
import ParameterMatrixView from './ParameterMatrixView'
import WalkForwardChart from './WalkForwardChart'

interface BacktestResultViewProps {
  result: BacktestResult
}

export default function BacktestResultView({ result }: BacktestResultViewProps) {
  const { filtered, selectedRegime, selectRegime, page, setPage } = useBacktestFilter(result)

  const best = bestConfigName(filtered.summary)
  const totalTrades = filtered.summary.reduce((sum, s) => sum + s.total_trades, 0)

  return (
    <div className="space-y-6">
      <BacktestHeader
        generatedAt={result.generated_at}
        dataRange={result.data_range}
        totalTrades={totalTrades}
      />

      <RegimeFilter selectedRegime={selectedRegime} onSelect={selectRegime} />

      {/* Summary cards */}
      <SectionErrorBoundary title="Summary Cards">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.summary.map((s) => (
            <SummaryCard
              key={s.config}
              config={s.config}
              description={result.configs[s.config]?.description ?? ''}
              win_rate_pct={s.win_rate_pct}
              total_pnl_pct={s.total_pnl_pct}
              sharpe={s.sharpe}
              max_drawdown_pct={s.max_drawdown_pct}
              total_trades={s.total_trades}
              isBest={s.config === best}
            />
          ))}
        </div>
      </SectionErrorBoundary>

      {/* Parameter Comparison */}
      <SectionErrorBoundary title="Parameter Comparison">
        <div>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Parameter Comparison</h2>
          <ParamCompareTable configs={result.configs} summary={filtered.summary} />
          <div className="mt-4">
            <ConfigWeightsDetail configs={result.configs} />
          </div>
        </div>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Weight Heatmap">
        <WeightHeatmap configs={result.configs} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Param Sweep Heatmap">
        <ParamSweepHeatmap summary={filtered.summary} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Radar Comparison">
        <RadarCompareChart summary={filtered.summary} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Sensitivity Analysis">
        <SensitivityAnalysis configs={result.configs} summary={filtered.summary} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Parameter Matrix">
        <ParameterMatrixView />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Walk-Forward Analysis">
        <WalkForwardChart />
      </SectionErrorBoundary>

      {result.by_regime && Object.keys(result.by_regime).length > 0 && (
        <SectionErrorBoundary title="Performance by Regime">
          <div>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Performance by Regime</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['trending', 'ranging', 'volatile'].map(regime => (
                <RegimeMiniCard
                  key={regime}
                  regime={regime}
                  summaries={result.by_regime![regime] ?? []}
                />
              ))}
            </div>
          </div>
        </SectionErrorBoundary>
      )}

      {filtered.pnl_curve && Object.keys(filtered.pnl_curve).length > 0 && (
        <SectionErrorBoundary title="PnL Chart">
          <PnlCompareChart pnlCurve={filtered.pnl_curve} configs={result.configs} />
        </SectionErrorBoundary>
      )}

      <SectionErrorBoundary title="Performance Scatter">
        <PerformanceScatter summary={filtered.summary} configs={result.configs} />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Direction Breakdown">
        <DirectionBreakdown summary={filtered.summary} />
      </SectionErrorBoundary>

      {filtered.summary.length > 1 && (
        <SectionErrorBoundary title="Trade Distribution">
          <TradeDistributionChart summary={filtered.summary} />
        </SectionErrorBoundary>
      )}

      {Object.keys(filtered.by_symbol).length > 0 && (
        <SectionErrorBoundary title="Win Rate Compare">
          <WinRateCompareChart bySymbol={filtered.by_symbol} configs={result.configs} />
        </SectionErrorBoundary>
      )}

      <SymbolTableSection
        bySymbol={filtered.by_symbol}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}
