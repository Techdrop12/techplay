// ✅ src/components/BackToTop.js

'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handle = () => setShow(window.scrollY > 200);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  if (!show) return null;

  return (
    <button
      className="fixed bottom-7 right-8 bg-blue-600 text-white px-4 py-2 rounded-full shadow-xl z-50"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Retour en haut"
    >
      ↑ Haut
    </button>
  );
}
