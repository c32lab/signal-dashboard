interface DecisionMetaProps {
  agreeRatio?: number | null
  combinedScore?: number | null
  decisionType?: string | null
  reasoning?: string | null
}

export default function DecisionMeta({ agreeRatio, combinedScore, decisionType, reasoning }: DecisionMetaProps) {
  const hasMetaItems = agreeRatio != null || combinedScore != null || decisionType

  return (
    <>
      {hasMetaItems && (
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 border-t border-gray-700/50 pt-2">
          {agreeRatio != null && (
            <span>
              <span className="text-gray-600">Agree ratio: </span>
              <span className="text-gray-300 font-mono">{(agreeRatio * 100).toFixed(1)}%</span>
            </span>
          )}
          {combinedScore != null && (
            <span>
              <span className="text-gray-600">Combined score: </span>
              <span className={`font-mono ${combinedScore > 0 ? 'text-green-400' : combinedScore < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {combinedScore.toFixed(3)}
              </span>
            </span>
          )}
          {decisionType && (
            <span>
              <span className="text-gray-600">Type: </span>
              <span className="text-gray-300">{decisionType}</span>
            </span>
          )}
        </div>
      )}

      {reasoning && (
        <p className="text-xs text-gray-500 border-t border-gray-700/50 pt-2">
          <span className="text-gray-600">Reasoning: </span>
          {reasoning}
        </p>
      )}
    </>
  )
}
