'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // Initialisation : vérifie localStorage ou utilise le système
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = stored || (prefersDark ? 'dark' : 'light');

      setTheme(initial);
      document.documentElement.classList.toggle('dark', initial === 'dark');
      document.documentElement.classList.toggle('light', initial === 'light');
    } catch (e) {
      console.warn('[ThemeContext] Erreur chargement thème :', e);
    }
  }, []);

  // Applique le thème à chaque mise à jour
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.classList.toggle('light', theme === 'light');
    } catch (e) {
      console.warn('[ThemeContext] Erreur application thème :', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
