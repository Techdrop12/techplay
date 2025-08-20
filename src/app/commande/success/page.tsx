// src/app/commande/success/page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useCart } from '@/hooks/useCart';
import { formatPrice, cn } from '@/lib/utils';
import { event as gaEvent, trackPurchase } from '@/lib/ga';

type SnapshotItem = {
  _id: string;
  slug?: string;
  title: string;
  image?: string;
  price: number;
  quantity: number;
};

export default function SuccessPage() {
  const sp = useSearchParams();
  const sessionId = sp.get('session_id') || '';
  const isMock = sp.get('mock') === '1';

  // Cart du contexte (sera vidé après capture du snapshot)
  const { cart, total, clearCart } = useCart();

  // --- Snapshot à l’arrivée (avant clearCart) ---
  const [snapshot, setSnapshot] = useState<{
    items: SnapshotItem[];
    itemsCount: number;
    totalPaid: number;
  }>({ items: [], itemsCount: 0, totalPaid: 0 });

  // Compteur d’items courant (avant snapshot)
  const itemsCountNow = useMemo(
    () => (cart || []).reduce((s, it: any) => s + Math.max(1, Number(it?.quantity || 1)), 0),
    [cart]
  );

  // Gate anti double-envoi
  const firedRef = useRef(false);
  const srRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    // 1) Capture snapshot au premier rendu
    if (!firedRef.current) {
      const safeItems: SnapshotItem[] = (cart || []).map((it: any) => ({
        _id: String(it?._id ?? it?.slug ?? ''),
        slug: it?.slug,
        title: String(it?.title ?? 'Produit'),
        image: String(it?.image ?? '/placeholder.png'),
        price: Number(it?.price ?? 0),
        quantity: Math.max(1, Number(it?.quantity ?? 1)),
      }));

      setSnapshot({
        items: safeItems,
        itemsCount: itemsCountNow,
        totalPaid: Number(total || safeItems.reduce((s, i) => s + i.price * i.quantity, 0)),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    // 2) Vidage du panier (après snapshot)
    try {
      clearCart();
    } catch {}

    // 3) Feedback UX
    toast.success('Paiement confirmé, merci !');
    if (srRef.current) srRef.current.textContent = 'Paiement confirmé, merci !';

    // 4) Tracking GA4 purchase (items + transaction_id)
    const txId = sessionId || (isMock ? 'mock_session' : 'no_session');
    try {
      if (snapshot.items.length > 0) {
        trackPurchase?.({
          transaction_id: txId,
          currency: 'EUR',
          value: snapshot.totalPaid,
          shipping: 0,
          tax: 0,
          items: snapshot.items.map((i) => ({
            item_id: i._id,
            item_name: i.title,
            price: i.price,
            quantity: i.quantity,
          })),
        });
      } else {
        // fallback très light si on n’a pas les items
        gaEvent?.({
          action: 'purchase',
          category: 'ecommerce',
          label: txId,
          value: snapshot.totalPaid,
        });
      }
    } catch {}

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isMock, snapshot.items.length, snapshot.totalPaid]);

  const hasItems = snapshot.items.length > 0;

  return (
    <main
      id="main"
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 text-center"
      aria-labelledby="success-title"
      role="main"
    >
      {/* Live region a11y */}
      <p ref={srRef} className="sr-only" role="status" aria-live="polite" />

      <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" aria-hidden="true" />
      <h1 id="success-title" className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
        Paiement confirmé 🎉
      </h1>

      <p className="mt-3 text-gray-600 dark:text-gray-400">
        Merci pour votre commande ! Vous recevrez un e-mail de confirmation sous peu.
      </p>

      <div className="mt-8 inline-flex flex-col items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
        {sessionId && (
          <p>
            Session Stripe :{' '}
            <code className="text-xs break-all">{sessionId}</code>
          </p>
        )}
        <p>
          Articles : <strong>{snapshot.itemsCount}</strong> • Total payé :{' '}
          <strong>{formatPrice(snapshot.totalPaid)}</strong>
        </p>
      </div>

      {/* Mini récap (optionnel) */}
      {hasItems && (
        <section
          aria-label="Récapitulatif de la commande"
          className="mt-8 text-left card p-4 sm:p-5 shadow-soft-lg"
        >
          <ul role="list" className="divide-y divide-gray-200/70 dark:divide-zinc-800">
            {snapshot.items.slice(0, 3).map((it) => (
              <li key={it._id} className="py-3 flex items-center gap-4">
                <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
                  <Image
                    src={it.image || '/placeholder.png'}
                    alt={it.title || 'Produit'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{it.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qté {it.quantity}
                  </p>
                </div>
                <div className="text-right font-semibold tabular-nums">
                  {formatPrice(it.price * it.quantity)}
                </div>
              </li>
            ))}
          </ul>

          {snapshot.items.length > 3 && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              + {snapshot.items.length - 3} autre(s) article(s)…
            </p>
          )}

          <div className="mt-3 flex items-center justify-end">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Total :{' '}
              <strong className="text-brand dark:text-white">
                {formatPrice(snapshot.totalPaid)}
              </strong>
            </span>
          </div>
        </section>
      )}

      <div className="mt-10 flex items-center justify-center gap-3">
        <Link
          href="/produit"
          className={cn(
            'rounded-lg bg-accent text-white px-5 py-2 font-semibold shadow',
            'hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40'
          )}
        >
          Continuer mes achats
        </Link>
        <Link
          href="/compte/commandes"
          className={cn(
            'rounded-lg border border-gray-300 dark:border-zinc-700 px-5 py-2 font-semibold',
            'hover:bg-gray-50 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
          )}
        >
          Voir mes commandes
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">
        Besoin d’aide ?{' '}
        <Link href="/contact" className="underline">
          Contactez-nous
        </Link>
        .
      </p>
    </main>
  );
}
