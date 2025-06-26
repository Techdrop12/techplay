// ✅ src/components/ThemeToggle.js

'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Init mode selon système utilisateur
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <button
      aria-label="Basculer le mode sombre"
      className="p-2 rounded bg-gray-100 dark:bg-gray-800 border"
      onClick={() => setDark((v) => !v)}
      style={{ position: 'fixed', top: 12, right: 12, zIndex: 100 }}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
