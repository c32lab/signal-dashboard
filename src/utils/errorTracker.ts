export interface TrackedError {
  message: string
  source: string
  timestamp: number
}

const MAX_ERRORS = 50
const recentErrors: TrackedError[] = []
let totalErrorCount = 0

function pushError(err: TrackedError) {
  recentErrors.unshift(err)
  if (recentErrors.length > MAX_ERRORS) recentErrors.pop()
  totalErrorCount++
}

export function initErrorTracker() {
  window.addEventListener('error', (event) => {
    pushError({
      message: event.message || String(event.error),
      source: `${event.filename ?? 'unknown'}:${event.lineno ?? 0}:${event.colno ?? 0}`,
      timestamp: Date.now(),
    })
    console.error('[ErrorTracker]', event.message, event.filename, event.lineno)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const msg =
      event.reason instanceof Error
        ? event.reason.message
        : String(event.reason)
    pushError({
      message: msg,
      source: 'unhandledrejection',
      timestamp: Date.now(),
    })
    console.error('[ErrorTracker] Unhandled rejection:', msg)
  })
}

export function getRecentErrors(limit = 10): TrackedError[] {
  return recentErrors.slice(0, limit)
}

export function getErrorCount(): number {
  return totalErrorCount
}

export function clearErrors() {
  recentErrors.length = 0
  totalErrorCount = 0
}
