import { PAGE_SIZE } from './constants'

export default function Pagination({
  offset,
  total,
  startRecord,
  endRecord,
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  offset: number
  total: number
  startRecord: number
  endRecord: number
  currentPage: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
      <span>
        {startRecord}–{endRecord} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={offset === 0}
          className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹ Prev
        </button>
        <span className="px-3">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={endRecord >= total}
          className="px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next ›
        </button>
      </div>
    </div>
  )
}

// Re-export PAGE_SIZE so callers don't need a separate import
export { PAGE_SIZE }
