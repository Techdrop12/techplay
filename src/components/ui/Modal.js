'use client';

import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, children, title }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onEsc);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-lg w-full p-6 shadow-lg relative">
        <h2 id="modal-title" className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ✕
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
}
