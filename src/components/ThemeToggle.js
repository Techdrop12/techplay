// ✅ /src/components/ThemeToggle.js (bonus dark mode auto)
'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, []);

  function toggle() {
    setDark(d => {
      const next = !d;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }

  return (
    <button
      onClick={toggle}
      aria-label="Basculer mode sombre"
      className="ml-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      type="button"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
