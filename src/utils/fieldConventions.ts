/**
 * Field Conventions — backend response value format contract
 *
 * Prevents RCA-006 type double ×100 bugs on percent fields.
 * Check this file before adding a new field to confirm format and whether frontend conversion is needed.
 *
 * Rules:
 *   Fields ending in _pct → already percent, display as-is (e.g. 43.64 → "43.64%")
 *   confidence / strength → 0-1 decimal, ×100 on display
 *   funding_rate → tiny decimal (e.g. -5.39e-05), ×100 on display
 *   ratio / index → display raw value, no conversion
 */

// ─── Signal API (:18800) ─────────────────────────────────────────────────────

export const SIGNAL_FIELDS = {
  // /api/overview → latest
  'decision.confidence':       { format: 'decimal_0_1', display: '×100 → %', example: '0.676 → 67.6%' },
  'decision.combined_score':   { format: 'raw_number',  display: 'display as-is', example: '-0.112' },
  'decision.price_at_decision':{ format: 'usd_price',   display: 'display as-is', example: '68292.06' },

  // /api/performance
  'performance.accuracy_pct':  { format: 'already_pct', display: 'append %', example: '43.64 → "43.64%"' },
  'performance.avg_pnl_pct':   { format: 'already_pct', display: 'append %', example: '0.1358 → "0.14%"' },

  // /api/accuracy/trend
  'trend.accuracy_pct':        { format: 'already_pct', display: 'append %', example: '51.6 → "51.6%"' },

  // /api/signal_quality
  'quality.avg_confidence':    { format: 'decimal_0_1', display: '×100 → %', example: '0.778 → 77.8%' },
  'quality.actionable_rate_pct': { format: 'already_pct', display: 'append %', example: '15.2 → "15.2%"' },

  // /api/decisions raw_json
  'raw.suggested_stop_loss':   { format: 'usd_price',   display: 'display as-is', example: '67400.0' },
  'raw.suggested_take_profit': { format: 'usd_price',   display: 'display as-is', example: '69800.0' },
} as const

// ─── Predict API (:8092) ─────────────────────────────────────────────────────

export const PREDICT_FIELDS = {
  // /api/prediction → macro
  'macro.funding_rate':        { format: 'tiny_decimal', display: '×100 → %', example: '-5.39e-05 → "-0.005%"' },
  'macro.funding_rate_avg':    { format: 'tiny_decimal', display: '×100 → %', example: '-3.81e-06 → "-0.000%"' },
  'macro.fear_greed':          { format: 'index_0_100',  display: 'display as-is (Fear & Greed Index)', example: '10' },
  'macro.volume_ratio':        { format: 'ratio',        display: 'display as-is', example: '0.199' },
  'macro.etf_flow_1d':         { format: 'usd_amount',   display: '÷1e6 → $XM', example: '-50000000 → "-$50M"' },

  // /api/prediction → predictions
  'prediction.confidence':     { format: 'decimal_0_1',  display: '×100 → %', example: '0.573 → 57.3%' },
  'prediction.expected_impact':{ format: 'already_pct',  display: 'append %', example: '7.02 → "7.02%"' },

  // /api/prediction → event_kb.events
  'event.price_change':        { format: 'already_pct',  display: 'append %', example: '6.13 → "6.13%"' },

  // /api/prediction → event_kb.patterns
  'pattern.avg_impact':        { format: 'already_pct',  display: 'append %', example: '-10.0 → "-10.0%"' },
} as const

// ─── Data-Eng API (:8081) ────────────────────────────────────────────────────

export const DATAENG_FIELDS = {
  // /api/price-ranges
  'ranges.p5':                 { format: 'usd_price',   display: 'display as-is', example: '19.52' },
  'ranges.p95':                { format: 'usd_price',   display: 'display as-is', example: '224.84' },
  'ranges.current':            { format: 'usd_price',   display: 'display as-is', example: '85.37' },

  // /api/price-ranges/validate
  'validate.valid':            { format: 'boolean',      display: 'true/false', example: 'false' },
} as const

// ─── Format reference ────────────────────────────────────────────────────────────────
//
// already_pct  — backend value is already percent → frontend just toFixed(N) + "%"
//                WARNING: NEVER ×100 again! This was the root cause of RCA-006
//
// decimal_0_1  — 0~1 decimal → frontend ×100 + "%" (e.g. confidence, strength)
//
// tiny_decimal — very small value (e.g. funding rate) → frontend ×100 + "%"
//
// index_0_100  — 0~100 index value → display number as-is, no %
//
// ratio        — ratio → display as-is, keep 2-3 decimal places
//
// usd_price    — USD price → toLocaleString + "$"
//
// usd_amount   — USD amount → typically ÷1e6 displayed as "$XM"
//
// raw_number   — raw numeric value → display as-is with appropriate decimals

/**
 * Safe percent display — decides whether to ×100 based on field format
 */
export function toDisplayPercent(value: number, fieldFormat: 'already_pct' | 'decimal_0_1' | 'tiny_decimal'): number {
  if (fieldFormat === 'already_pct') return value
  return value * 100
}
