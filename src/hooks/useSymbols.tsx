import { createContext, useContext } from 'react'
import { useHealth } from '../hooks/useApi'

const SymbolsContext = createContext<string[]>([])

const FALLBACK_SYMBOLS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT']

export function SymbolsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useHealth()
  const symbols = data?.active_symbols ?? FALLBACK_SYMBOLS
  return (
    <SymbolsContext.Provider value={symbols}>
      {children}
    </SymbolsContext.Provider>
  )
}

export function useSymbols(): string[] {
  return useContext(SymbolsContext)
}
