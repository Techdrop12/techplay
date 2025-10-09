// src/components/PushPermission.js
// Ne demande PAS automatiquement : expose une API pour déclencher sur geste utilisateur.
'use client';

import { useEffect } from 'react';

export default function PushPermission() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // API globale : window.tpAskPush() → déclenche la demande (à appeler sur un clic bouton par ex.)
    /** @type {any} */ (window).tpAskPush = async () => {
      try {
        if (!('Notification' in window)) return { ok: false, error: 'unsupported' };
        if (Notification.permission === 'granted') return { ok: true, already: true };
        if (Notification.permission === 'denied') return { ok: false, error: 'denied' };
        const r = await Notification.requestPermission();
        return { ok: r === 'granted' };
      } catch {
        return { ok: false, error: 'unknown' };
      }
    };

    // Écouteur facultatif (CustomEvent) pour déclencher depuis n’importe où
    const onAsk = () => {
      try {
        if (typeof /** @type {any} */ (window).tpAskPush === 'function') {
          /** @type {any} */ (window).tpAskPush();
        }
      } catch {}
    };

    window.addEventListener('tp:ask-push', onAsk);
    return () => window.removeEventListener('tp:ask-push', onAsk);
  }, []);

  return null;
}
