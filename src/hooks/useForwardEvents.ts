import useSWR from 'swr'
import { predictApi } from '../api/predict'

export function useForwardEvents() {
  const { data, error, isLoading } = useSWR(
    'predict/forward-events',
    () => predictApi.forwardEvents(),
    { refreshInterval: 60_000, shouldRetryOnError: false },
  )
  return {
    events: data?.events ?? [],
    error,
    isLoading,
  }
}
