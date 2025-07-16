'use client';

import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    setEnabled(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = () => {
    const newMode = !enabled;
    setEnabled(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 rounded text-sm border hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      {enabled ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
