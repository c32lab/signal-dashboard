/**
 * Time formatting — always UTC+8 (Asia/Shanghai)
 * TEAM.md mandate: never rely on browser local timezone
 */

const UTC8_OFFSET = 8 * 60 * 60 * 1000

function toUTC8(date: Date): Date {
  // Get UTC timestamp, then add 8-hour offset
  return new Date(date.getTime() + UTC8_OFFSET)
}

/** Full date-time: "03-06 17:09 UTC+8" */
export function formatDateTime(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mi = String(d.getUTCMinutes()).padStart(2, "0")
  return `${mm}-${dd} ${hh}:${mi} UTC+8`
}

/** Time only: "17:09:23" (UTC+8, for compact views like LiveFeed) */
export function formatTime(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mi = String(d.getUTCMinutes()).padStart(2, "0")
  const ss = String(d.getUTCSeconds()).padStart(2, "0")
  return `${hh}:${mi}:${ss}`
}

/** Date only: "2026-03-06" */
export function formatDate(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const y = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${mm}-${dd}`
}

/** Chart X-axis: "17:09" */
export function formatChartTime(ts: string | number): string {
  const d = toUTC8(new Date(ts))
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mi = String(d.getUTCMinutes()).padStart(2, "0")
  return `${hh}:${mi}`
}

/** Price formatting — BTC/ETH 2 decimals, altcoins auto */
export function formatPrice(value: number, symbol?: string): string {
  const isMajor = symbol && (symbol.startsWith("BTC") || symbol.startsWith("ETH"))
  if (isMajor || value >= 1) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`
}
