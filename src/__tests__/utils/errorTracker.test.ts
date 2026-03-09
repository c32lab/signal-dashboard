import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  initErrorTracker,
  getRecentErrors,
  getErrorCount,
  clearErrors,
} from '../../utils/errorTracker'

describe('errorTracker', () => {
  let errorHandler: ((event: ErrorEvent) => void) | null = null
  let rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null

  beforeEach(() => {
    clearErrors()
    vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type: string, handler: unknown) => {
        if (type === 'error') errorHandler = handler as typeof errorHandler
        if (type === 'unhandledrejection')
          rejectionHandler = handler as typeof rejectionHandler
      },
    )

    initErrorTracker()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('captures window error events', () => {
    errorHandler!({
      message: 'Test error',
      filename: 'test.ts',
      lineno: 42,
      colno: 10,
      error: new Error('Test error'),
    } as ErrorEvent)

    const errors = getRecentErrors()
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toBe('Test error')
    expect(errors[0].source).toBe('test.ts:42:10')
    expect(getErrorCount()).toBe(1)
  })

  it('captures unhandled promise rejections', () => {
    rejectionHandler!({
      reason: new Error('Promise failed'),
    } as PromiseRejectionEvent)

    const errors = getRecentErrors()
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toBe('Promise failed')
    expect(errors[0].source).toBe('unhandledrejection')
  })

  it('handles non-Error rejection reasons', () => {
    rejectionHandler!({
      reason: 'string rejection',
    } as PromiseRejectionEvent)

    const errors = getRecentErrors()
    expect(errors[0].message).toBe('string rejection')
  })

  it('limits returned errors via getRecentErrors(limit)', () => {
    for (let i = 0; i < 5; i++) {
      errorHandler!({
        message: `error-${i}`,
        filename: 'f.ts',
        lineno: i,
        colno: 0,
        error: null,
      } as unknown as ErrorEvent)
    }

    expect(getRecentErrors(3)).toHaveLength(3)
    expect(getRecentErrors()).toHaveLength(5)
    expect(getErrorCount()).toBe(5)
  })

  it('returns most recent errors first', () => {
    errorHandler!({ message: 'first', filename: '', lineno: 0, colno: 0, error: null } as unknown as ErrorEvent)
    errorHandler!({ message: 'second', filename: '', lineno: 0, colno: 0, error: null } as unknown as ErrorEvent)

    const errors = getRecentErrors()
    expect(errors[0].message).toBe('second')
    expect(errors[1].message).toBe('first')
  })

  it('clearErrors resets state', () => {
    errorHandler!({ message: 'err', filename: '', lineno: 0, colno: 0, error: null } as unknown as ErrorEvent)
    expect(getErrorCount()).toBe(1)

    clearErrors()
    expect(getErrorCount()).toBe(0)
    expect(getRecentErrors()).toHaveLength(0)
  })
})
