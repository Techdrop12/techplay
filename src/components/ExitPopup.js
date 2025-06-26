// ✅ src/components/ExitPopup.js

'use client';

import { useEffect, useState } from 'react';

export default function ExitPopup({ show, onClose, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) setVisible(true);
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  if (!visible && !show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 max-w-sm w-full">
        {children}
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setVisible(false);
            onClose && onClose();
          }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
