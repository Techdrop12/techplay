// src/context/themeContext.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeContextValue {
  /** Valeur choisie ('light' | 'dark' | 'system') */
  theme: ThemeMode
  /** Valeur appliquée après résolution de 'system' */
  resolvedTheme: Exclude<ThemeMode, 'system'>
  /** Raccourci pratique */
  isDark: boolean
  /** Forcer un thème */
  setTheme: (mode: ThemeMode) => void
  /** Bascule rapide light/dark (si 'system', bascule par rapport au résolu) */
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

  // Résout la préférence OS
  const getSystemTheme = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

  // Lecture initiale + application immédiate
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

    // Suivre la préférence OS si l'utilisateur est en 'system'
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onScheme = () => {
      if (saved === 'system') {
        const next = getSystemTheme()
        setResolved(next)
        applyTheme(next)
      }
    }
    mq.addEventListener?.('change', onScheme)

    // Sync inter-onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_KEY) return
      const next = (e.newValue as ThemeMode) ?? 'system'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Setter public
  const setTheme = (mode: ThemeMode) => {
    try {
      localStorage.setItem(THEME_KEY, mode)
    } catch {}
    const nextResolved = mode === 'system' ? getSystemTheme() : mode
    setThemeState(mode)
    setResolved(nextResolved)
    applyTheme(nextResolved)
  }

  // Toggle pratique
  const toggleTheme = () => {
    const base: Exclude<ThemeMode, 'system'> = theme === 'system' ? resolved : theme
    setTheme(base === 'dark' ? 'light' : 'dark')
  }

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: resolved,
      isDark: resolved === 'dark',
      setTheme,
      toggleTheme
    }),
    [theme, resolved]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

/** Export par défaut pour compat éventuels imports default */
export default ThemeProvider
