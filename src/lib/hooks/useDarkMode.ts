// src/lib/hooks/useDarkMode.ts — compat: wrap du ThemeProvider
import { useMemo } from 'react'
import { useTheme } from '@/context/themeContext'

export function useDarkMode() {
  const { resolvedTheme, setTheme, toggleTheme } = useTheme()
  return useMemo(
    () => ({
      isDark: resolvedTheme === 'dark',
      setDark: (v: boolean) => setTheme(v ? 'dark' : 'light'),
      toggle: toggleTheme,
    }),
    [resolvedTheme, setTheme, toggleTheme]
  )
}
