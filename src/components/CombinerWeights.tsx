import { useCombinerWeights } from '../hooks/useApi'
import CombinerWeightsChart from './CombinerWeightsChart'
import SectionSkeleton from './ui/SectionSkeleton'
import ApiError from './ui/ApiError'
import EmptyState from './ui/EmptyState'

interface WeightEntry {
  source: string
  weight: number
  disabled: boolean
}

export default function CombinerWeights() {
  const { data, error, isLoading, mutate } = useCombinerWeights()

  if (isLoading) {
    return <SectionSkeleton label="combiner weights" />
  }

  if (error) {
    return <ApiError message={`Combiner Weights: ${error.message}`} onRetry={() => mutate()} />
  }

  if (!data?.weights || Object.keys(data.weights).length === 0) {
    return <EmptyState message="No combiner weights data" />
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
