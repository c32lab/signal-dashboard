import SectionErrorBoundary from '../components/SectionErrorBoundary'
import {
  KpiCardGrid,
  FilterBar,
  SymbolSummary,
  DecisionTable,
  Pagination,
  PAGE_SIZE,
} from '../components/history'
import { useTraderHistory } from '../components/history/useTraderHistory'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TraderHistory() {
  const {
    symbolFilter, actionFilter, directionFilter, typeFilter, timePeriod, exporting,
    handleSymbol, handleAction, handleDirection, handleType, handleExport, setTimePeriod,
    decisions, total, isLoading, error,
    overall, activeSignals, perfData, typeOptions,
    offset, setOffset, startRecord, endRecord, currentPage, totalPages,
  } = useTraderHistory()

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* A. KPI Cards */}
      <SectionErrorBoundary title="KPI Cards">
        {isLoading && !overall ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 animate-pulse">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="h-3 bg-gray-800 rounded w-20" />
                <div className="h-6 bg-gray-800 rounded w-14" />
              </div>
            ))}
          </div>
        ) : (
          <KpiCardGrid overall={overall} activeSignals={activeSignals} />
        )}
      </SectionErrorBoundary>

      {/* B. Filter Bar */}
      <SectionErrorBoundary title="Filters">
        <FilterBar
          symbolFilter={symbolFilter}
          actionFilter={actionFilter}
          typeFilter={typeFilter}
          directionFilter={directionFilter}
          timePeriod={timePeriod}
          typeOptions={typeOptions}
          exporting={exporting}
          total={total}
          onSymbol={handleSymbol}
          onAction={handleAction}
          onType={handleType}
          onDirection={handleDirection}
          onTimePeriod={setTimePeriod}
          onExport={handleExport}
        />
      </SectionErrorBoundary>

      {/* F. Symbol Performance Summary */}
      {symbolFilter && perfData?.by_symbol && (
        <SectionErrorBoundary title="Symbol Summary">
          <SymbolSummary symbol={symbolFilter} bySymbol={perfData.by_symbol} />
        </SectionErrorBoundary>
      )}

      {/* C. Decision Table */}
      <SectionErrorBoundary title="Decision Table">
        <DecisionTable
          decisions={decisions}
          isLoading={isLoading}
          error={error}
        />
      </SectionErrorBoundary>

      {/* D. Pagination */}
      {!isLoading && !error && total > 0 && (
        <SectionErrorBoundary title="Pagination">
          <Pagination
            offset={offset}
            total={total}
            startRecord={startRecord}
            endRecord={endRecord}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setOffset(o => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset(o => o + PAGE_SIZE)}
          />
        </SectionErrorBoundary>
      )}
    </div>
  )
}
