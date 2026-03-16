'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Prefs = {
  analytics: boolean;
  ads: boolean;
};

declare global {
  interface Window {
    tpConsentUpdate?: (payload: {
      analytics?: boolean;
      ads?: boolean;
      functionality?: boolean;
      ad_user_data?: boolean;
      ad_personalization?: boolean;
    }) => void;
  }
}

function readPrefs(): Prefs {
  try {
    return {
      analytics: localStorage.getItem('consent:analytics') === '1',
      ads: localStorage.getItem('consent:ads') === '1',
    };
  } catch {
    return { analytics: false, ads: false };
  }
}

function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem('consent:analytics', prefs.analytics ? '1' : '0');
    localStorage.setItem('consent:ads', prefs.ads ? '1' : '0');
    localStorage.setItem('consent:decided', '1');
  } catch {}
}

function applyConsent(prefs: Prefs) {
  try {
    window.dispatchEvent(new CustomEvent('tp:consent', { detail: prefs }));
  } catch {}
  try {
    window.tpConsentUpdate?.({
      analytics: prefs.analytics,
      ads: prefs.ads,
      functionality: true,
      ad_user_data: prefs.ads,
      ad_personalization: prefs.ads,
    });
  } catch {}
}

export default function ConfidentialitePrefs() {
  const t = useTranslations('privacy_prefs');
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, ads: false });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  const save = () => {
    writePrefs(prefs);
    applyConsent(prefs);
    setMessage('Préférences mises à jour.');
  };

  const revoke = () => {
    const next: Prefs = { analytics: false, ads: false };
    setPrefs(next);
    writePrefs(next);
    applyConsent(next);
    setMessage('Consentement révoqué.');
  };

  return (
    <section
      className="mt-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/50 p-5"
      aria-labelledby="prefs-heading"
    >
      <h2 id="prefs-heading" className="mb-3 text-[15px] font-semibold">
        Préférences de confidentialité
      </h2>
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-4">
          <span className="text-[13px]">Mesure d&apos;audience (Analytics)</span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[hsl(var(--accent))]"
            checked={prefs.analytics}
            onChange={(e) =>
              setPrefs((current) => ({
                ...current,
                analytics: e.target.checked,
              }))
            }
          />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-[13px]">Publicité</span>
          <input
            type="checkbox"
            className="h-5 w-5 accent-[hsl(var(--accent))]"
            checked={prefs.ads}
            onChange={(e) =>
              setPrefs((current) => ({
                ...current,
                ads: e.target.checked,
              }))
            }
          />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            className="btn-premium rounded-full px-5 py-2.5 text-[13px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            {t('save_btn')}
          </button>
          <button
            type="button"
            onClick={revoke}
            className="btn-outline rounded-full px-5 py-2.5 text-[13px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            Tout refuser
          </button>
        </div>
        <p id="prefs-message" className="sr-only" aria-live="polite">
          {message}
        </p>
        {message && (
          <p className="text-[13px] text-[hsl(var(--accent))]" aria-hidden>
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
