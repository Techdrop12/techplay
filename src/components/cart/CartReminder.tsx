'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useCart } from '@/hooks/useCart';
import { pageview } from '@/lib/analytics';

export default function CartReminder() {
  const t = useTranslations('cart');
  const { cart } = useCart();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  // Enregistre le panier dans localStorage pour un rappel persistant
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('techplay_last_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Déclenche le rappel après 30s d'inactivité
  useEffect(() => {
    if (cart.length === 0) {
      setShow(false);
      return;
    }

    const timer = window.setTimeout(() => setShow(true), 30_000);
    return () => window.clearTimeout(timer);
  }, [cart]);

  // Génère une suggestion basée sur le dernier produit ajouté
  useEffect(() => {
    if (cart.length === 0) {
      setSuggestion(null);
      return;
    }

    const lastProduct = cart[cart.length - 1];
    const fallback = 'Cliquez ici pour reprendre votre commande.';
    setSuggestion(lastProduct?.title ? `Vous aimerez peut-être : ${lastProduct.title}` : fallback);
  }, [cart]);

  // Tracking pageview + gtag si dispo
  useEffect(() => {
    if (!show) return;

    pageview('/cart-reminder');

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cart_reminder_displayed');
      }
    } catch {
      // no-op
    }
  }, [show]);

  const handleClick = () => {
    setShow(false);
    router.push('/cart');
  };

  if (!show || !suggestion) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-label={t('cart_reminder_aria')}
      className="fixed bottom-4 right-4 z-50 w-[90%] max-w-sm cursor-pointer rounded-lg bg-[hsl(var(--accent))] px-4 py-3 text-[hsl(var(--accent-fg))] shadow-[var(--shadow-lg)] transition-opacity hover:opacity-90 sm:w-auto animate-fadeIn"
      onClick={handleClick}
    >
      <strong className="mb-1 block font-semibold">🛒 Vous avez un panier en attente</strong>
      <span className="text-sm">{suggestion}</span>
    </div>
  );
}
