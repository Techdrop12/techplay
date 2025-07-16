'use client';

import { useEffect } from 'react';

export default function ModalWrapper({ children, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-w-md w-full">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">✖</button>
        {children}
      </div>
    </div>
  );
}
