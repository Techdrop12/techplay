// ✅ src/components/PWAInstallPrompt.js

'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white border shadow-lg rounded px-6 py-4 z-50 flex items-center">
      <span className="mr-4">💾 Installez TechPlay sur votre appareil !</span>
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={async () => {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          setVisible(false);
        }}
      >
        Installer
      </button>
      <button
        className="ml-2 text-gray-400"
        onClick={() => setVisible(false)}
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
