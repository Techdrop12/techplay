"use client"

import { createContext, useContext } from 'react'
import { useLocale } from 'next-intl'

const LangContext = createContext()

export function LangProvider({ children }) {
  const locale = useLocale()
  return <LangContext.Provider value={{ locale }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
