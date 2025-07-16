'use client';

import { useEffect, useState } from 'react';

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button onClick={toggleTheme} className="p-2 text-sm">
      {isDark ? '☀️ Mode clair' : '🌙 Mode sombre'}
    </button>
  );
}
