// ✅ /src/components/BackToTop.js (autre variante retour haut, bonus UX)
'use client';

import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="fixed bottom-4 left-4 bg-blue-600 text-white rounded-full p-3 shadow-xl z-50 hover:bg-blue-800 transition"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Haut de page"
    >
      ↑ Haut
    </button>
  );
}
