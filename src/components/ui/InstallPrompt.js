'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    });
  }, []);

  const install = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setVisible(false));
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-900 border px-6 py-3 rounded shadow-md flex items-center gap-4 z-40">
      <p className="text-sm">📱 Installer TechPlay en app ?</p>
      <button
        onClick={install}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
      >
        Installer
      </button>
    </div>
  );
}
