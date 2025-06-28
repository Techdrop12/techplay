// ✅ /src/components/ExitPopup.js (popup exit-intent, bonus conversion)
'use client';

import { useEffect, useState } from 'react';

export default function ExitPopup({ message, onAccept }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onMouseLeave = (e) => {
      if (e.clientY <= 0) setShow(true);
    };
    document.addEventListener('mouseout', onMouseLeave);
    return () => document.removeEventListener('mouseout', onMouseLeave);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded shadow-xl max-w-sm mx-auto text-center">
        <h3 className="font-bold text-lg mb-2">Ne partez pas !</h3>
        <p className="mb-4">{message || "Profitez de notre offre spéciale avant de quitter !"}</p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded"
          onClick={() => {
            setShow(false);
            onAccept && onAccept();
          }}
        >
          Je profite de l’offre
        </button>
      </div>
    </div>
  );
}
