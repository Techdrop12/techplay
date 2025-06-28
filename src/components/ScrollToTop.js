'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 transition"
      aria-label="Remonter en haut"
      title="Remonter"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}
