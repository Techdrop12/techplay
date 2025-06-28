// ✅ /src/components/ToastNotification.js (bonus notification simple, alternative)
'use client';

export default function ToastNotification({ show, message, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed top-8 right-8 bg-blue-700 text-white px-6 py-3 rounded shadow-lg z-50">
      {message}
      <button className="ml-4" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
