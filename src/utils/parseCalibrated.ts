/** Extract calibrated_confidence from raw_json.combined */
export function parseCalibratedConfidence(rawJson?: string): number | null {
  if (!rawJson) return null
  try {
    const parsed = JSON.parse(rawJson)
    const cal = parsed?.combined?.calibrated_confidence
    return typeof cal === 'number' && cal > 0 ? cal : null
  } catch {
    return null
  }
}
