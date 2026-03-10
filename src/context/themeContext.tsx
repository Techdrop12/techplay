'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: Exclude<ThemeMode, 'system'>
  isDark: boolean
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const THEME_KEY = 'theme' as const

function applyTheme(mode: Exclude<ThemeMode, 'system'>) {
  const root = document.documentElement
  const isDark = mode === 'dark'
  root.classList.toggle('dark', isDark)
  root.classList.toggle('light', !isDark)
  root.setAttribute('data-theme', mode)
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system')
  const [resolved, setResolved] = useState<Exclude<ThemeMode, 'system'>>('light')

  const getSystemTheme = useCallback((): Exclude<ThemeMode, 'system'> => {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }, [])

  useEffect(() => {
    const saved: ThemeMode = (() => {
      try {
        const v = localStorage.getItem(THEME_KEY)
        return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
      } catch {
        return 'system'
      }
    })()

    const initialResolved =
      saved === 'system' ? getSystemTheme() : (saved as Exclude<ThemeMode, 'system'>)

    setThemeState(saved)
    setResolved(initialResolved)
    applyTheme(initialResolved)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const onScheme = () => {
      setThemeState((current) => {
        if (current !== 'system') return current
        const next = getSystemTheme()
        setResolved(next)
        applyTheme(next)
        return current
      })
    }

    mq.addEventListener?.('change', onScheme)

    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY) return

      const next =
        e.newValue === 'light' || e.newValue === 'dark' || e.newValue === 'system'
          ? e.newValue
          : 'system'

      const nextResolved = next === 'system' ? getSystemTheme() : next
      setThemeState(next)
      setResolved(nextResolved)
      applyTheme(nextResolved)
    }

    window.addEventListener('storage', onStorage)

    return () => {
      mq.removeEventListener?.('change', onScheme)
      window.removeEventListener('storage', onStorage)
    }
  }, [getSystemTheme])

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      try {
        localStorage.setItem(THEME_KEY, mode)
      } catch {}

      const nextResolved = mode === 'system' ? getSystemTheme() : mode
      setThemeState(mode)
      setResolved(nextResolved)
      applyTheme(nextResolved)
    },
    [getSystemTheme]
  )

  const toggleTheme = useCallback(() => {
    const base: Exclude<ThemeMode, 'system'> = theme === 'system' ? resolved : theme
    setTheme(base === 'dark' ? 'light' : 'dark')
  }, [theme, resolved, setTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: resolved,
      isDark: resolved === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, resolved, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

export default ThemeProvider