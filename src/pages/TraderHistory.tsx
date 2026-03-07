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
        <KpiCardGrid overall={overall} activeSignals={activeSignals} />
      </SectionErrorBoundary>

      {/* B. Filter Bar */}
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

      {/* F. Symbol Performance Summary */}
      {symbolFilter && perfData?.by_symbol && (
        <SymbolSummary symbol={symbolFilter} bySymbol={perfData.by_symbol} />
      )}

      {/* C. Decision Table */}
      <DecisionTable
        decisions={decisions}
        isLoading={isLoading}
        error={error}
      />

      {/* D. Pagination */}
      {!isLoading && !error && total > 0 && (
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
      )}
    </div>
  )
}
