import { formatDateTime, formatDate } from '../../utils/format'
import { daysBetween } from './backtestUtils'

interface BacktestHeaderProps {
  generatedAt: string
  dataRange?: { start: string; end: string }
  totalTrades: number
}

export default function BacktestHeader({ generatedAt, dataRange, totalTrades }: BacktestHeaderProps) {
  const days = dataRange ? daysBetween(dataRange.start, dataRange.end) : 0

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100">Backtest A/B Test</h1>
      <div className="mt-1 text-xs text-gray-500 space-x-3 flex flex-wrap gap-y-1">
        <span>Generated: {formatDateTime(generatedAt)}</span>
        {dataRange && (
          <>
            <span>·</span>
            <span>
              Data: {formatDate(dataRange.start)} – {formatDate(dataRange.end)}
            </span>
            <span>·</span>
            <span>{days} 天</span>
          </>
        )}
        <span>·</span>
        <span>{totalTrades} 笔交易</span>
      </div>
    </div>
  )
}
