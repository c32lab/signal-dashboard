/**
 * Field Conventions — 后端返回值格式约定
 *
 * 避免 RCA-006 类百分比 ×100 重复 bug。
 * 新字段接入时必须查这个文件确认格式，再决定前端是否需要转换。
 *
 * 规则：
 *   字段名以 _pct 结尾 → 已经是百分比，直接显示（如 43.64 → "43.64%"）
 *   confidence / strength → 0-1 小数，显示时 ×100
 *   funding_rate → 极小小数 (如 -5.39e-05)，显示时 ×100
 *   ratio / index → 原值显示，不转换
 */

// ─── Signal API (:18800) ─────────────────────────────────────────────────────

export const SIGNAL_FIELDS = {
  // /api/overview → latest
  'decision.confidence':       { format: 'decimal_0_1', display: '×100 → %', example: '0.676 → 67.6%' },
  'decision.combined_score':   { format: 'raw_number',  display: '直接显示', example: '-0.112' },
  'decision.price_at_decision':{ format: 'usd_price',   display: '直接显示', example: '68292.06' },

  // /api/performance
  'performance.accuracy_pct':  { format: 'already_pct', display: '直接加 %', example: '43.64 → "43.64%"' },
  'performance.avg_pnl_pct':   { format: 'already_pct', display: '直接加 %', example: '0.1358 → "0.14%"' },

  // /api/accuracy/trend
  'trend.accuracy_pct':        { format: 'already_pct', display: '直接加 %', example: '51.6 → "51.6%"' },

  // /api/signal_quality
  'quality.avg_confidence':    { format: 'decimal_0_1', display: '×100 → %', example: '0.778 → 77.8%' },
  'quality.actionable_rate_pct': { format: 'already_pct', display: '直接加 %', example: '15.2 → "15.2%"' },

  // /api/decisions raw_json
  'raw.suggested_stop_loss':   { format: 'usd_price',   display: '直接显示', example: '67400.0' },
  'raw.suggested_take_profit': { format: 'usd_price',   display: '直接显示', example: '69800.0' },
} as const

// ─── Predict API (:18801) ────────────────────────────────────────────────────

export const PREDICT_FIELDS = {
  // /api/prediction → macro
  'macro.funding_rate':        { format: 'tiny_decimal', display: '×100 → %', example: '-5.39e-05 → "-0.005%"' },
  'macro.funding_rate_avg':    { format: 'tiny_decimal', display: '×100 → %', example: '-3.81e-06 → "-0.000%"' },
  'macro.fear_greed':          { format: 'index_0_100',  display: '直接显示（恐惧贪婪指数）', example: '10' },
  'macro.volume_ratio':        { format: 'ratio',        display: '直接显示', example: '0.199' },
  'macro.etf_flow_1d':         { format: 'usd_amount',   display: '÷1e6 → $XM', example: '-50000000 → "-$50M"' },

  // /api/prediction → predictions
  'prediction.confidence':     { format: 'decimal_0_1',  display: '×100 → %', example: '0.573 → 57.3%' },
  'prediction.expected_impact':{ format: 'already_pct',  display: '直接加 %', example: '7.02 → "7.02%"' },

  // /api/prediction → event_kb.events
  'event.price_change':        { format: 'already_pct',  display: '直接加 %', example: '6.13 → "6.13%"' },

  // /api/prediction → event_kb.patterns
  'pattern.avg_impact':        { format: 'already_pct',  display: '直接加 %', example: '-10.0 → "-10.0%"' },
} as const

// ─── 格式说明 ────────────────────────────────────────────────────────────────
//
// already_pct  — 后端已是百分比值 → 前端直接 toFixed(N) + "%"
//                ⚠️ 绝对不要再 ×100！这是 RCA-006 的根因
//
// decimal_0_1  — 0~1 小数 → 前端 ×100 + "%" (如 confidence, strength)
//
// tiny_decimal — 极小值 (如 funding rate) → 前端 ×100 + "%"
//
// index_0_100  — 0~100 的指数值 → 直接显示数字，不加 %
//
// ratio        — 比率 → 直接显示，保留 2-3 位小数
//
// usd_price    — 美元价格 → toLocaleString + "$"
//
// usd_amount   — 美元金额 → 通常需要 ÷1e6 显示为 "$XM"
//
// raw_number   — 原始数值 → 直接显示，保留适当小数位

/**
 * 安全百分比显示 — 根据字段格式决定是否 ×100
 */
export function toDisplayPercent(value: number, fieldFormat: 'already_pct' | 'decimal_0_1' | 'tiny_decimal'): number {
  if (fieldFormat === 'already_pct') return value
  return value * 100
}
