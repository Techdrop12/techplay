'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = window.localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const defaultTheme = saved || (prefersDark ? 'dark' : 'light')

      setTheme(defaultTheme)
      document.documentElement.classList.toggle('dark', defaultTheme === 'dark')
      window.localStorage.setItem('theme', defaultTheme)
    } catch (e) {
      console.warn('Erreur lecture themeContext:', e)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      try {
        window.localStorage.setItem('theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
      } catch (e) {
        console.warn('Erreur sauvegarde themeContext:', e)
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
