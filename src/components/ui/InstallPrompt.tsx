'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] px-6 py-3 rounded-xl shadow-[var(--shadow-lg)] flex items-center gap-4 z-40">
      <p className="text-sm">📱 Installer TechPlay en app ?</p>
      <button
        onClick={install}
        className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] px-3 py-1 rounded hover:opacity-95 text-sm"
      >
        Installer
      </button>
    </div>
  );
}
