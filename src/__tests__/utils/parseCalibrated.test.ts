import { describe, it, expect } from 'vitest'
import { parseCalibratedConfidence } from '../../utils/parseCalibrated'

describe('parseCalibratedConfidence', () => {
  it('returns calibrated_confidence from combined object', () => {
    const raw = JSON.stringify({ combined: { calibrated_confidence: 0.612 } })
    expect(parseCalibratedConfidence(raw)).toBe(0.612)
  })

  it('returns null when rawJson is undefined', () => {
    expect(parseCalibratedConfidence(undefined)).toBeNull()
  })

  it('returns null when rawJson is empty string', () => {
    expect(parseCalibratedConfidence('')).toBeNull()
  })

  it('returns null when rawJson is malformed', () => {
    expect(parseCalibratedConfidence('{bad json')).toBeNull()
  })

  it('returns null when combined is missing', () => {
    const raw = JSON.stringify({ decision_type: 'FAST' })
    expect(parseCalibratedConfidence(raw)).toBeNull()
  })

  it('returns null when calibrated_confidence is missing from combined', () => {
    const raw = JSON.stringify({ combined: { signals: [] } })
    expect(parseCalibratedConfidence(raw)).toBeNull()
  })

  it('returns null when calibrated_confidence is 0', () => {
    const raw = JSON.stringify({ combined: { calibrated_confidence: 0 } })
    expect(parseCalibratedConfidence(raw)).toBeNull()
  })

  it('returns null when calibrated_confidence is negative', () => {
    const raw = JSON.stringify({ combined: { calibrated_confidence: -0.5 } })
    expect(parseCalibratedConfidence(raw)).toBeNull()
  })

  it('returns null when calibrated_confidence is not a number', () => {
    const raw = JSON.stringify({ combined: { calibrated_confidence: 'high' } })
    expect(parseCalibratedConfidence(raw)).toBeNull()
  })

  it('ignores top-level calibrated_confidence', () => {
    const raw = JSON.stringify({ calibrated_confidence: 0.8, combined: {} })
    expect(parseCalibratedConfidence(raw)).toBeNull()
  })
})
