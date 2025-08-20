// /src/lib/hooks/useDarkMode.ts
// Hook dark-mode robuste (SSR-safe, sync onglets, écoute media query)
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function applyTheme (dark: boolean) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', dark)
}

export function useDarkMode () {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const stored = localStorage.getItem(STORAGE_KEY)
    const initial = stored ? stored === 'dark' : mq.matches
    setIsDark(initial)
    applyTheme(initial)

    const onMq = (e: MediaQueryListEvent) => {
      // si pas de préférence stockée, on suit la MQ
      const storedPref = localStorage.getItem(STORAGE_KEY)
      if (!storedPref) {
        setIsDark(e.matches)
        applyTheme(e.matches)
      }
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const v = e.newValue === 'dark'
        setIsDark(v)
        applyTheme(v)
      }
    }
    mq.addEventListener?.('change', onMq)
    window.addEventListener('storage', onStorage)
    return () => {
      mq.removeEventListener?.('change', onMq)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setDark = useCallback((v: boolean) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, v ? 'dark' : 'light')
    setIsDark(v)
    applyTheme(v)
  }, [])

  const toggle = useCallback(() => setDark(!isDark), [isDark, setDark])

  return { isDark, setDark, toggle }
}
