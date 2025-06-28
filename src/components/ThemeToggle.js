'use client';

import { useTheme } from '@/context/themeContext';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Empêche les erreurs d’hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      aria-label="Basculer le thème"
      title="Changer de thème"
      className="p-2 rounded-full border text-xl transition bg-white text-black dark:bg-gray-800 dark:text-white hover:scale-105"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
