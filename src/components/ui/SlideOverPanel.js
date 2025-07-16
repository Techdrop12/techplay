'use client';

export default function SlideOverPanel({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-80 shadow-lg p-4 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
