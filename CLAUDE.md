# CLAUDE.md - Signal Dashboard

## 项目概述
React + Vite + Tailwind + Recharts + SWR 前端 dashboard，展示加密货币信号系统的决策、预测和质量数据。

## 技术栈
- React 19 + TypeScript 5.9 + Vite 7
- Tailwind CSS v4（通过 @tailwindcss/vite 插件）
- Recharts 3（图表）
- SWR 2（数据获取 + 缓存）
- React Router v7（路由）

## 开发
```bash
npm run dev    # Vite dev server on :3080
npm run build  # tsc + vite build
npm run lint   # ESLint
```

## 配置层级（⚠️ 关键 — RCA-007 教训）
当前只有一层配置：`vite.config.ts`（proxy + 端口）。
如果未来新增 `.env` 文件，必须在此处标注优先级和作用范围。

### Proxy 映射
| 前缀 | 目标 | 后端服务 |
|------|------|---------|
| `/api` | `localhost:18810` | amani-signal（信号引擎）|
| `/predict-api` | `localhost:18801` | amani-predict（预测引擎）|
| `/data-api` | `localhost:8081` | data-eng（数据工程）|

`/predict-api` 和 `/data-api` 有 path rewrite，去掉前缀后转发。

## 页面结构
| 路由 | 页面 | 数据源 |
|------|------|--------|
| `/` | Dashboard (概览) | signal API |
| `/predict` | Predict Dashboard (预测) | predict API |
| `/backtest` | Backtest A/B Test (回测) | signal API |
| `/history` | Trader History (历史) | signal API |
| `/quality` | Quality Tracker (信号质量) | signal API |
| `/advanced/chain` | Industry Chain (产业链图谱) | predict API |
| `/advanced/system` | System Health (系统健康) | signal API |
| `/code-quality` | Code Quality (内部工具,不在导航) | — |

## 百分比字段格式（⚠️ 关键 — RCA-006 教训）
**改任何百分比显示前必读 `src/utils/fieldConventions.ts`**

### 规则
- 字段名含 `_pct` → 已经是百分比（0-100），直接显示 + `%`
- `confidence` / `strength` → 0-1 小数，前端 ×100
- `funding_rate` → 极小小数，前端 ×100
- `price_change` / `avg_impact` / `expected_impact` → 已经是百分比，**绝对不要 ×100**
- `accuracy['1h_pct']` / `accuracy['4h_pct']` → 已经是百分比（0-100），不要 ×100

### 来自 API 的 `_meta` 字段
大多数端点返回 `_meta` 字段标注值的格式（如 `"confidence": "0-1"`），前端忽略即可。

## 数据验证（Fallback 机制）
`src/utils/dataValidation.ts` 有 `STATIC_PRICE_RANGES` 硬编码回退值。
优先级：data-eng API (`/data-api/api/price-ranges`) > 静态回退。
**修改时注意保持两层一致。**

## 文件结构
```
src/
├── api/          # API 客户端（index.ts=signal, predict.ts=predict）
├── hooks/        # SWR hooks（useApi.ts, usePredictApi.ts）
├── types/        # TypeScript 类型定义
├── utils/        # 工具函数（字段格式、数据验证）
├── components/   # 共享组件
├── pages/        # 页面组件（每页一个文件）
└── main.tsx      # 入口
```

## 主题
深色主题：`bg-gray-950`（页面背景）、`bg-gray-900`（卡片）、`border-gray-800`。

## 提交规范
- 前缀：feat / fix / docs / config / chore / refactor / test
- `git add` 用具体文件名，禁止 `git add -A`
- 提交前运行 `npx tsc --project tsconfig.app.json --noEmit` 确保无 TS 错误（注意是 tsconfig.app.json 不是 tsconfig.json）
- **提交后立即部署：** `cd ~/signal-dashboard && docker compose down && docker compose up -d --build`
- Docker build 用 `tsc -b`（比 tsconfig.app.json 更严格），确保两者都 0 error

## Recharts Tooltip（⚠️ 重复教训 ×3）
Recharts Tooltip 的 `labelFormatter` / `formatter` 回调参数类型可能是 `undefined` 或 `ReactNode`，不是 `string`。**必须加防御：**
```typescript
// ✅ 正确
labelFormatter={(ts: unknown) => formatDateTime(String(ts ?? ''))}
formatter={(value: unknown, name: unknown) => [`${Number(value ?? 0).toFixed(2)}%`, String(name ?? '')]}

// ❌ 错误 — 会报 TS 类型错误
labelFormatter={(ts) => formatDateTime(String(ts))}
formatter={(value, name) => [`${Number(value).toFixed(2)}%`, String(name)]}
```

## 禁止
- **一个 repo 同时只能有一个 CC 操作** — 多 CC 并行同一 repo 会导致冲突、互相覆盖文件、端口被改。串行执行，不并行
- **绝对不要修改 vite.config.ts 的 proxy 端口** — `/api` → :18800, `/predict-api` → :18801, `/data-api` → :8081。这些端口是固定的。:18810 是被废弃的旧方案，绝不使用
- **绝对不要修改 nginx.conf / docker-compose.yml / Dockerfile 的端口** — Dashboard 端口是 **3080**（开发和生产都是 3080）。:18800 是 amani-signal API，不是前端。CC 不要碰端口配置
- **绝对不要删除或 revert 已有的组件文件** — 特别是 ConfidenceDistribution.tsx、AccuracyKPI.tsx 等。这些是人工审核后的正式功能，不是 out-of-scope artifact
- 不要对 `price_change` / `avg_impact` / `expected_impact` 做 ×100
- 不要引入新的 CSS 框架（已有 Tailwind）
- 不要使用 `sudo npm`
