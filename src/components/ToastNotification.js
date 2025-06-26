// ✅ src/components/ToastNotification.js

'use client';

import { useEffect, useState } from 'react';

export default function ToastNotification({ message, type = 'success', delay = 3500 }) {
  const [show, setShow] = useState(!!message);

  useEffect(() => {
    if (!message) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), delay);
    return () => clearTimeout(t);
  }, [message, delay]);

  if (!show) return null;
  return (
    <div className={`fixed bottom-6 right-8 z-50 px-5 py-3 rounded shadow-lg font-bold
      ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {message}
    </div>
  );
}
