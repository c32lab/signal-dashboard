import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

const DB_PATH = '/Users/zhwu/.openclaw/workspace/amani-signal/data/decisions.db'
const PORT = 18810

const db = new Database(DB_PATH, { readonly: true })
db.pragma('journal_mode = WAL')

const app = express()
app.use(cors({ origin: /localhost/ }))
app.use(express.json())

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// GET /api/overview
app.get('/api/overview', (_req, res) => {
  const total_decisions = (db.prepare('SELECT COUNT(*) as n FROM decisions').get() as { n: number }).n

  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString()
  const recent1hRows = db.prepare(
    'SELECT symbol, COUNT(*) as n FROM decisions WHERE timestamp >= ? GROUP BY symbol'
  ).all(oneHourAgo) as { symbol: string; n: number }[]
  const recent_1h: Record<string, number> = {}
  for (const r of recent1hRows) recent_1h[r.symbol] = r.n

  const actionRows = db.prepare(
    'SELECT action, COUNT(*) as n FROM decisions GROUP BY action'
  ).all() as { action: string; n: number }[]
  const action_distribution: Record<string, number> = {}
  for (const r of actionRows) action_distribution[r.action] = r.n

  const symbolRows = db.prepare(
    'SELECT symbol, COUNT(*) as n FROM decisions GROUP BY symbol'
  ).all() as { symbol: string; n: number }[]
  const symbol_distribution: Record<string, number> = {}
  for (const r of symbolRows) symbol_distribution[r.symbol] = r.n

  const typeRows = db.prepare(
    'SELECT decision_type, COUNT(*) as n FROM decisions GROUP BY decision_type'
  ).all() as { decision_type: string; n: number }[]
  const type_distribution: Record<string, number> = {}
  for (const r of typeRows) type_distribution[r.decision_type] = r.n

  res.json({ total_decisions, recent_1h, action_distribution, symbol_distribution, type_distribution })
})

// GET /api/decisions
app.get('/api/decisions', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 200)
  const offset = Number(req.query.offset) || 0
  const symbol = (req.query.symbol as string) || ''
  const action = (req.query.action as string) || ''
  const type = (req.query.type as string) || ''

  const conditions: string[] = []
  const params: unknown[] = []

  if (symbol) { conditions.push('symbol = ?'); params.push(symbol) }
  if (action) { conditions.push('action = ?'); params.push(action) }
  if (type) { conditions.push('decision_type = ?'); params.push(type) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const total = (db.prepare(`SELECT COUNT(*) as n FROM decisions ${where}`).get(...params as []) as { n: number }).n
  const decisions = db.prepare(
    `SELECT * FROM decisions ${where} ORDER BY timestamp DESC LIMIT ? OFFSET ?`
  ).all(...params as [], limit, offset)

  res.json({ decisions, total, limit, offset })
})

// GET /api/decisions/:id
app.get('/api/decisions/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM decisions WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

// GET /api/signals/latest — latest decision per symbol
app.get('/api/signals/latest', (_req, res) => {
  const signals = db.prepare(
    `SELECT d.* FROM decisions d
     INNER JOIN (
       SELECT symbol, MAX(timestamp) as max_ts FROM decisions GROUP BY symbol
     ) latest ON d.symbol = latest.symbol AND d.timestamp = latest.max_ts
     ORDER BY d.timestamp DESC`
  ).all()
  res.json({ signals })
})

// GET /api/performance
app.get('/api/performance', (_req, res) => {
  const bySymbol = db.prepare(
    `SELECT symbol,
            COUNT(*) as total,
            SUM(is_correct_1h) as correct,
            ROUND(AVG(is_correct_1h) * 100, 2) as accuracy_pct,
            ROUND(AVG(pnl_1h_pct), 4) as avg_pnl_pct
     FROM signal_accuracy
     GROUP BY symbol
     ORDER BY symbol`
  ).all()

  const overall = db.prepare(
    `SELECT COUNT(*) as total,
            SUM(is_correct_1h) as correct,
            ROUND(AVG(is_correct_1h) * 100, 2) as accuracy_pct,
            ROUND(AVG(pnl_1h_pct), 4) as avg_pnl_pct
     FROM signal_accuracy`
  ).get()

  res.json({ by_symbol: bySymbol, overall })
})

// GET /api/accuracy/trend?hours=24
app.get('/api/accuracy/trend', (req, res) => {
  const hours = Math.min(Number(req.query.hours) || 24, 168)
  const since = new Date(Date.now() - hours * 3600_000).toISOString()

  const rows = db.prepare(
    `SELECT strftime('%Y-%m-%dT%H:00', created_at) as hour,
            symbol,
            COUNT(*) as total,
            SUM(is_correct_1h) as correct,
            ROUND(AVG(is_correct_1h) * 100, 2) as accuracy_pct
     FROM signal_accuracy
     WHERE created_at >= ?
     GROUP BY hour, symbol
     ORDER BY hour ASC, symbol ASC`
  ).all(since)

  res.json(rows)
})

// GET /api/signal_quality?hours=6
app.get('/api/signal_quality', (req, res) => {
  const hours = Math.min(Number(req.query.hours) || 6, 168)
  const since = new Date(Date.now() - hours * 3600_000).toISOString()

  const bySymbol = db.prepare(
    `SELECT sa.symbol,
            COUNT(*) as total_signals,
            SUM(sa.is_correct_1h) as correct,
            ROUND(AVG(sa.is_correct_1h) * 100, 2) as accuracy_pct,
            ROUND(AVG(sa.pnl_1h_pct), 4) as avg_pnl_pct,
            ROUND(MAX(sa.pnl_1h_pct), 4) as best_pnl,
            ROUND(MIN(sa.pnl_1h_pct), 4) as worst_pnl
     FROM signal_accuracy sa
     WHERE sa.created_at >= ?
     GROUP BY sa.symbol
     ORDER BY sa.symbol`
  ).all(since)

  res.json({ by_symbol: bySymbol })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
