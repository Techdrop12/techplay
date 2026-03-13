'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Locale = string

interface LangContextValue {
  locale: Locale
  changeLocale: (newLocale: Locale) => void
}

const LangContext = createContext<LangContextValue | undefined>(undefined)

interface LangProviderProps {
  children: ReactNode
  defaultLocale?: Locale
}

export function LangProvider({ children, defaultLocale = 'fr' }: LangProviderProps) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale')
      if (stored) setLocale(stored)
    }
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  return (
    <LangContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = (): LangContextValue => {
  const ctx = useContext(LangContext)
  if (ctx === undefined) throw new Error('useLang must be used within LangProvider')
  return ctx
}
