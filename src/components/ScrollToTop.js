// ✅ /src/components/ScrollToTop.js (bouton retour en haut bonus)
'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-blue-800 z-50"
      aria-label="Remonter"
    >
      ↑
    </button>
  );
}
