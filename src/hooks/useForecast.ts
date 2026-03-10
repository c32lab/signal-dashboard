import { useState, useEffect } from 'react'
import type { ForecastPanelData } from '../types'
import { mockForecastData } from '../mocks/forecast'

export function useForecastPanel() {
  const [data, setData] = useState<ForecastPanelData | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate async loading; swap to real API call later
    const timer = setTimeout(() => {
      setData(mockForecastData)
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return { data, error: undefined, isLoading }
}
