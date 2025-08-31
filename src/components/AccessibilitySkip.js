// ✅ src/components/AccessibilitySkip.js — Skip link full a11y (focus + smooth scroll + fallbacks)
'use client';

import { useCallback } from 'react';

export default function AccessibilitySkip({
  target = '#main',
  label = 'Aller au contenu principal',
  className = '',
}) {
  const onClick = useCallback((e) => {
    try {
      const id = String(target).replace(/^#/, '');
      const el =
        document.getElementById(id) ||
        document.querySelector(String(target)) ||
        document.querySelector('#main-content') ||
        document.querySelector('main');

      if (!el) return; // laisse le comportement par défaut si rien trouvé

      // Rendre focusable si besoin
      const hadTabIndex = el.hasAttribute('tabindex');
      if (!hadTabIndex) el.setAttribute('tabindex', '-1');

      // Focus + scroll smooth (sans reflow)
      el.focus({ preventScroll: true });
      try { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch {}

      // Empêche le jump d’ancre classique
      e.preventDefault();

      // Restaure le tabindex une fois que l’utilisateur sort du bloc
      const restore = () => {
        if (!hadTabIndex) el.removeAttribute('tabindex');
        el.removeEventListener('blur', restore);
      };
      el.addEventListener('blur', restore);
    } catch {
      // no-op
    }
  }, [target]);

  return (
    <a
      id="skip-to-content"
      href={target}
      onClick={onClick}
      className={[
        // Visuellement masqué jusqu’au focus clavier
        'sr-only focus-visible:not-sr-only',
        // Positionnement sûr (pas de reflow)
        'fixed top-2 left-2 z-[9999]',
        // Style accessible (contraste, focus ring)
        'rounded-lg bg-yellow-300 px-4 py-2 text-black shadow',
        'outline-none ring-0 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2',
        'dark:bg-yellow-400',
        className,
      ].join(' ')}
    >
      {label}
    </a>
  );
}
