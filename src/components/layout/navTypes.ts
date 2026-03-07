export interface NavItem {
  to: string
  label: string
  end?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export type NavEntry = NavItem | NavGroup

export function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

export const NAV_ENTRIES: NavEntry[] = [
  { to: '/', label: '信号概览', end: true },
  { to: '/backtest', label: '回测对比' },
  { to: '/trading', label: '交易记录' },
  { to: '/history', label: '事件库' },
  { to: '/timeline', label: '信号时间轴' },
  {
    label: '高级分析',
    items: [
      { to: '/quality', label: '信号质量' },
      { to: '/advanced/system', label: '系统健康' },
    ],
  },
]
