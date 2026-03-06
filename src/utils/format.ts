/**
 * 时间格式化 — 统一 UTC+8（Asia/Shanghai）
 * TEAM.md 强制规范：禁止依赖浏览器本地时区
 */

const UTC8_OFFSET = 8 * 60 * 60 * 1000

function toUTC8(date: Date): Date {
  // 先获取 UTC 时间戳，再加 8 小时偏移
  return new Date(date.getTime() + UTC8_OFFSET)
}

/** 完整日期时间: "03-06 17:09 UTC+8" */
export function formatDateTime(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mi = String(d.getUTCMinutes()).padStart(2, "0")
  return `${mm}-${dd} ${hh}:${mi} UTC+8`
}

/** 仅时间: "17:09:23" (UTC+8, 用于 LiveFeed 等紧凑场景) */
export function formatTime(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mi = String(d.getUTCMinutes()).padStart(2, "0")
  const ss = String(d.getUTCSeconds()).padStart(2, "0")
  return `${hh}:${mi}:${ss}`
}

/** 仅日期: "2026-03-06" */
export function formatDate(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const y = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${mm}-${dd}`
}

/** 图表 X 轴: "17:09" */
export function formatChartTime(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mi = String(d.getUTCMinutes()).padStart(2, "0")
  return `${hh}:${mi}`
}

/** 价格格式化 — BTC/ETH 2 位，小币种自动 */
export function formatPrice(value: number, symbol?: string): string {
  const isMajor = symbol && (symbol.startsWith("BTC") || symbol.startsWith("ETH"))
  if (isMajor || value >= 1) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}
