import { PAGE_SIZE } from './constants'

export default function Pagination({
  offset,
  total,
  startRecord,
  endRecord,
  currentPage,
  totalPages,
  isDirectionFiltered,
  onPrev,
  onNext,
}: {
  offset: number
  total: number
  startRecord: number
  endRecord: number
  currentPage: number
  totalPages: number
  isDirectionFiltered: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
      <span>
        第 {startRecord}–{endRecord} 条 / 共 {total} 条
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={offset === 0}
          className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹ 上一页
        </button>
        <span className="px-3">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={endRecord >= total}
          className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          下一页 ›
        </button>
      </div>
    </div>
  )
}

// Re-export PAGE_SIZE so callers don't need a separate import
export { PAGE_SIZE }
