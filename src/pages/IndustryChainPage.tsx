import { useIndustryChain } from '../hooks/usePredictApi'
import { IndustryChainSection } from '../components/predict'
import SectionErrorBoundary from '../components/SectionErrorBoundary'

export default function IndustryChainPage() {
  const { data: chainData, isLoading } = useIndustryChain()
  const chainNodes = chainData?.nodes ?? []
  const chainEdges = chainData?.edges ?? []

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">产业链图谱</h1>
        <p className="text-sm text-gray-500 mt-1">
          分析币种之间的关联影响，用于跨币种信号校正
        </p>
      </div>
      <SectionErrorBoundary title="Industry Chain">
        {isLoading ? (
          <div className="text-gray-500 text-sm py-12 text-center">Loading…</div>
        ) : chainNodes.length === 0 ? (
          <div className="text-gray-500 text-sm py-12 text-center">No chain data available</div>
        ) : (
          <IndustryChainSection nodes={chainNodes} edges={chainEdges} />
        )}
      </SectionErrorBoundary>
    </div>
  )
}
