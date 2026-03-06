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
| `/` | Dashboard | signal API |
| `/quality` | Quality Tracker | signal API |
| `/history` | Trader History | signal API |
| `/predict` | Predict Dashboard | predict API |

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
- 提交前运行 `npx tsc --noEmit` 确保无 TS 错误

## 禁止
- **绝对不要修改 vite.config.ts 的 proxy 端口** — `/api` → :18800, `/predict-api` → :18801, `/data-api` → :8081。这些端口是固定的。:18810 是被废弃的旧方案，绝不使用
- **绝对不要修改 nginx.conf / docker-compose.yml / Dockerfile 的端口** — 生产端口是 18800（commit c9358f4 锁定），Vite dev 端口是 3080。两者独立，不要混淆
- 不要对 `price_change` / `avg_impact` / `expected_impact` 做 ×100
- 不要引入新的 CSS 框架（已有 Tailwind）
- 不要使用 `sudo npm`
