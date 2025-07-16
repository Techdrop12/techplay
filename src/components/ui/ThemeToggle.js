'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    setDark(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleTheme} className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
      {dark ? '☀️ Clair' : '🌙 Sombre'}
    </button>
  );
}
