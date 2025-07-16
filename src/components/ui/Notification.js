'use client';

import { useEffect } from 'react';

export default function Notification({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const colors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded text-white shadow ${colors[type]}`}>
      {message}
      <button
        onClick={onClose}
        className="ml-4 font-bold hover:underline"
        aria-label="Fermer la notification"
      >
        ×
      </button>
    </div>
  );
}
