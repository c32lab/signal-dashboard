const PREDICT_BASE = import.meta.env.VITE_PREDICT_API_URL || '/predict-api/api'

export interface PredictPredictionRaw {
  id: number
  symbol: string
  direction: 'LONG' | 'SHORT' | 'NEUTRAL'
  confidence: number
  trigger_pattern: string
  trigger_event: string
  expected_impact: number
  expected_horizon: string
  timestamp: string
  status: string
}

export interface PredictPredictionsResponse {
  predictions: PredictPredictionRaw[]
}

export interface PredictAccuracyResponse {
  overall: {
    accuracy_1d: number
    accuracy_3d: number
    accuracy_7d: number
    [key: string]: number
  }
}

export interface PredictHealthResponse {
  status: string
  [key: string]: unknown
}

async function predictFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Predict API: ${res.status}`)
  return res.json() as Promise<T>
}

export const predictApi = {
  activePredictions: (limit = 10) =>
    predictFetcher<PredictPredictionsResponse>(
      `${PREDICT_BASE}/predictions?status=active&limit=${limit}`
    ),

  accuracy: () =>
    predictFetcher<PredictAccuracyResponse>(`${PREDICT_BASE}/predict-accuracy`),

  health: () =>
    predictFetcher<PredictHealthResponse>(`${PREDICT_BASE}/health`),
}
