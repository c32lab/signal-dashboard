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
  { to: '/', label: 'Overview', end: true }, // zh: xinhao-gailan (Signal Overview)
  { to: '/backtest', label: 'Backtest' }, // zh: huice-duibi (Backtest Comparison)
  { to: '/trading', label: 'Trading' }, // zh: jiaoyi-jilu (Trade Records)
  { to: '/history', label: 'History' }, // zh: shijian-ku (Event Library)
  { to: '/timeline', label: 'Timeline' }, // zh: xinhao-shijianzhou (Signal Timeline)
  {
    label: 'Advanced', // zh: gaoji-fenxi (Advanced Analysis)
    items: [
      { to: '/quality', label: 'Quality' }, // zh: xinhao-zhiliang (Signal Quality)
      { to: '/advanced/system', label: 'System Health' }, // zh: xitong-jiankang (System Health)
    ],
  },
]
