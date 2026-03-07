export default function BacktestSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="h-5 bg-gray-800 rounded w-32" />
            <div className="h-4 bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-800 rounded w-3/4" />
          </div>
        ))}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl h-64" />
    </div>
  )
}
