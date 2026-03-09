export interface PerformanceMetrics {
  pageLoadMs: number | null
  apiResponseTimes: number[]
  avgApiResponseMs: number | null
}

const apiResponseTimes: number[] = []
const MAX_SAMPLES = 200

let pageLoadMs: number | null = null
let originalFetch: typeof window.fetch | null = null

export function initPerformanceMonitor() {
  // Measure page load time
  if (typeof window !== 'undefined' && window.performance) {
    const measure = () => {
      const nav = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming | undefined
      if (nav) {
        pageLoadMs = Math.round(nav.loadEventEnd - nav.startTime)
        if (pageLoadMs <= 0) pageLoadMs = null
      }
    }
    if (document.readyState === 'complete') {
      setTimeout(measure, 0)
    } else {
      window.addEventListener('load', () => setTimeout(measure, 0))
    }
  }

  // Wrap fetch to track API response times
  if (typeof window !== 'undefined' && !originalFetch) {
    originalFetch = window.fetch
    window.fetch = async function wrappedFetch(
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url
      const isApi = url.startsWith('/api') || url.includes('/api/')

      if (!isApi) return originalFetch!.call(window, input, init)

      const start = performance.now()
      try {
        const response = await originalFetch!.call(window, input, init)
        recordApiTime(performance.now() - start)
        return response
      } catch (err) {
        recordApiTime(performance.now() - start)
        throw err
      }
    }
  }
}

function recordApiTime(ms: number) {
  apiResponseTimes.push(Math.round(ms))
  if (apiResponseTimes.length > MAX_SAMPLES) apiResponseTimes.shift()
}

export function getPerformanceMetrics(): PerformanceMetrics {
  const avg =
    apiResponseTimes.length > 0
      ? Math.round(
          apiResponseTimes.reduce((a, b) => a + b, 0) /
            apiResponseTimes.length,
        )
      : null
  return {
    pageLoadMs,
    apiResponseTimes: [...apiResponseTimes],
    avgApiResponseMs: avg,
  }
}

export function resetPerformanceMonitor() {
  apiResponseTimes.length = 0
  pageLoadMs = null
  if (originalFetch) {
    window.fetch = originalFetch
    originalFetch = null
  }
}
