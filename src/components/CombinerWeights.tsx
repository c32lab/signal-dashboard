import { useCombinerWeights } from '../hooks/useApi'
import CombinerWeightsChart from './CombinerWeightsChart'

interface WeightEntry {
  source: string
  weight: number
  disabled: boolean
}

export default function CombinerWeights() {
  const { data, error, isLoading } = useCombinerWeights()

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
        Loading combiner weights…
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-red-400 text-sm">
        Combiner Weights: {error.message}
      </div>
    )
  }

  if (!data?.weights || Object.keys(data.weights).length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center text-gray-500 text-sm">
        No combiner weights data
      </div>
    )
  }

  const entries: WeightEntry[] = Object.entries(data.weights)
    .map(([source, weight]) => ({
      source,
      weight: Number(weight),
      disabled: Number(weight) === 0,
    }))
    .sort((a, b) => b.weight - a.weight)

  return (
    <section className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <h2 className="text-sm font-semibold text-gray-200 mb-4">
        Combiner Source Weights
      </h2>
      <CombinerWeightsChart entries={entries} />
    </section>
  )
}
