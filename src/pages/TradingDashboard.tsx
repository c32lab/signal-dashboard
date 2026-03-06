import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MOCK_ACCOUNT, MOCK_EQUITY_CURVE, MOCK_POSITIONS, MOCK_TRADES } from '../mocks/trading'
import type { Position, Trade } from '../types/trading'
import { formatDate, formatDateTime, formatPrice } from '../utils/format'

function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function pct(v: number, decimals = 2): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`
}

function pctColor(v: number): string {
  return v >= 0 ? 'text-green-400' : 'text-red-400'
}

// --- KPI card ---
interface KpiCardProps {
  label: string
  value: string
  valueClass?: string
  sub?: string
}

function KpiCard({ label, value, valueClass = 'text-gray-100', sub }: KpiCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xl font-mono font-bold ${valueClass}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  )
}

// --- Position card ---
function PositionCard({ pos }: { pos: Position }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-100 text-sm">{pos.symbol}</span>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            pos.direction === 'LONG'
              ? 'bg-green-900/50 text-green-400'
              : 'bg-red-900/50 text-red-400'
          }`}
        >
          {pos.direction}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="text-gray-500">Entry</span>
          <div className="font-mono text-gray-200">{formatPrice(pos.entry_price, pos.symbol)}</div>
        </div>
        <div>
          <span className="text-gray-500">Current</span>
          <div className="font-mono text-gray-200">{formatPrice(pos.current_price, pos.symbol)}</div>
        </div>
        <div>
          <span className="text-gray-500">Qty</span>
          <div className="font-mono text-gray-200">{pos.quantity}</div>
        </div>
        <div>
          <span className="text-gray-500">Unrealized PnL</span>
          <div className={`font-mono font-semibold ${pctColor(pos.unrealized_pnl)}`}>
            {pct(pos.unrealized_pnl)} ({pos.unrealized_pnl_usd >= 0 ? '+' : ''}${pos.unrealized_pnl_usd.toFixed(2)})
          </div>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Entry time</span>
          <div className="font-mono text-gray-400">{formatDateTime(pos.entry_time)}</div>
        </div>
      </div>
    </div>
  )
}

// --- Trade row ---
function TradeRow({ trade }: { trade: Trade }) {
  return (
    <tr className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors text-xs">
      <td className="py-2 px-3 font-mono text-gray-400 whitespace-nowrap">
        {formatDateTime(trade.timestamp)}
      </td>
      <td className="py-2 px-3 font-semibold text-gray-200">{trade.symbol}</td>
      <td className="py-2 px-3">
        <span
          className={`font-bold px-1.5 py-0.5 rounded text-xs ${
            trade.direction === 'LONG'
              ? 'bg-green-900/50 text-green-400'
              : 'bg-red-900/50 text-red-400'
          }`}
        >
          {trade.direction}
        </span>
      </td>
      <td className="py-2 px-3 font-mono text-gray-300">{formatPrice(trade.entry_price, trade.symbol)}</td>
      <td className="py-2 px-3 font-mono text-gray-300">
        {trade.exit_price !== null ? formatPrice(trade.exit_price, trade.symbol) : '—'}
      </td>
      <td className={`py-2 px-3 font-mono font-semibold ${trade.pnl !== null ? pctColor(trade.pnl) : 'text-gray-500'}`}>
        {trade.pnl !== null ? pct(trade.pnl) : '—'}
      </td>
      <td className="py-2 px-3 font-mono text-gray-400">{formatDuration(trade.duration_minutes)}</td>
    </tr>
  )
}

export default function TradingDashboard() {
  const account = MOCK_ACCOUNT
  const equityCurve = MOCK_EQUITY_CURVE
  const positions = MOCK_POSITIONS
  const trades = [...MOCK_TRADES].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Profit factor color
  const pfColor =
    account.profit_factor >= 1.5
      ? 'text-green-400'
      : account.profit_factor >= 1.0
        ? 'text-yellow-400'
        : 'text-red-400'

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-6">
      <h1 className="text-lg font-bold text-gray-100">NT 模拟盘交易面板</h1>

      {/* Section A: Account KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Balance"
          value={`$${account.balance_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
        />
        <KpiCard
          label="Win Rate"
          value={`${account.win_rate.toFixed(1)}%`}
          valueClass={account.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}
        />
        <KpiCard
          label="Profit Factor"
          value={account.profit_factor.toFixed(2)}
          valueClass={pfColor}
        />
        <KpiCard
          label="Max Drawdown"
          value={`-${account.max_drawdown_pct.toFixed(1)}%`}
          valueClass="text-red-400"
        />
      </div>

      {/* Section B: Equity Curve */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">净值曲线 (30天)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={equityCurve} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts: unknown) => formatDate(String(ts ?? ''))}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: unknown) => `$${Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              width={80}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af', fontSize: 11 }}
              itemStyle={{ color: '#60a5fa', fontSize: 12 }}
              labelFormatter={(ts: unknown) => formatDate(String(ts ?? ''))}
              formatter={(value: unknown) => [
                `$${Number(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                'Equity',
              ]}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#equityGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Section C: Open Positions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">当前持仓 ({positions.length})</h2>
        {positions.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500 text-sm">
            No open positions
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {positions.map((pos) => (
              <PositionCard key={`${pos.symbol}-${pos.entry_time}`} pos={pos} />
            ))}
          </div>
        )}
      </div>

      {/* Section D: Closed Trades */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">已平仓交易 ({trades.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="py-2 px-3 font-medium">时间</th>
                <th className="py-2 px-3 font-medium">Symbol</th>
                <th className="py-2 px-3 font-medium">方向</th>
                <th className="py-2 px-3 font-medium">开仓价</th>
                <th className="py-2 px-3 font-medium">平仓价</th>
                <th className="py-2 px-3 font-medium">PnL</th>
                <th className="py-2 px-3 font-medium">时长</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <TradeRow key={trade.id} trade={trade} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section E: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">总交易次数</div>
          <div className="text-2xl font-mono font-bold text-gray-100">{account.total_trades}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">平均盈利</div>
          <div className="text-2xl font-mono font-bold text-green-400">+{account.avg_win_pct.toFixed(2)}%</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">平均亏损</div>
          <div className="text-2xl font-mono font-bold text-red-400">{account.avg_loss_pct.toFixed(2)}%</div>
        </div>
      </div>

      {/* Win/Loss bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="text-xs text-gray-500 mb-2">盈亏比可视化</div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-green-400 font-mono w-16">盈 {account.win_rate.toFixed(1)}%</span>
          <div className="flex-1 flex rounded overflow-hidden h-4">
            <div
              className="bg-green-500/70 transition-all"
              style={{ width: `${account.win_rate}%` }}
            />
            <div
              className="bg-red-500/70 transition-all"
              style={{ width: `${(100 - account.win_rate)}%` }}
            />
          </div>
          <span className="text-red-400 font-mono w-16 text-right">亏 {(100 - account.win_rate).toFixed(1)}%</span>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-gray-500">
          <span>盈亏比 <span className="text-gray-300 font-mono">{account.profit_factor.toFixed(2)}</span></span>
          <span>Avg Win <span className="text-green-400 font-mono">+{account.avg_win_pct.toFixed(2)}%</span></span>
          <span>Avg Loss <span className="text-red-400 font-mono">{account.avg_loss_pct.toFixed(2)}%</span></span>
        </div>
      </div>
    </div>
  )
}
