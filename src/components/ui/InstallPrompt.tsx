'use client';

import { Smartphone } from 'lucide-react';
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
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-3 shadow-[var(--shadow-lg)]">
      <Smartphone aria-hidden className="h-5 w-5 shrink-0 text-[hsl(var(--accent))]" />
      <p className="text-sm">Installer TechPlay en app ?</p>
      <button
        type="button"
        onClick={install}
        className="rounded-lg bg-[hsl(var(--accent))] px-3 py-1.5 text-sm text-[hsl(var(--accent-fg))] outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
      >
        Installer
      </button>
    </div>
  );
}
