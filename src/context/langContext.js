// ✅ /src/context/langContext.js (contexte langue, bonus gestion automatique locale)
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LangContext = createContext();

export function LangProvider({ children, defaultLocale = 'fr' }) {
  const [locale, setLocale] = useState(defaultLocale);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale');
      if (stored) setLocale(stored);
    }
  }, []);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  return (
    <LangContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
