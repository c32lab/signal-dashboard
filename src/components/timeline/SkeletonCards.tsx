export default function SkeletonCards() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-28 shrink-0">
            <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-4 border-l-4 border-l-gray-700 space-y-3">
            <div className="h-4 w-40 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-64 bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-48 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
