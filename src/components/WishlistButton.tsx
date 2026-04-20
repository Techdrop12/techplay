'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Heart, HeartCrack } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useWishlist, type WishlistItemBase } from '@/hooks/useWishlist';
import { UI } from '@/lib/constants';
import { trackAddToWishlist } from '@/lib/ga';
import { getCurrentLocale } from '@/lib/i18n-routing';
import { logEvent } from '@/lib/logEvent';
import { cn } from '@/lib/utils';

interface WishlistProduct {
  _id?: string;
  id?: string;
  slug?: string;
  title?: string;
  price?: number;
  image?: string;
  [k: string]: unknown;
}

interface WishlistButtonProps {
  product: WishlistProduct;
  floating?: boolean;
  className?: string;
  disabled?: boolean;
  stopPropagation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  withLabel?: boolean;
}

const WISHLIST_LIMIT = UI.WISHLIST_LIMIT;

const TEXT = {
  fr: {
    addToWishlist: 'Ajouter à la wishlist',
    removeFromWishlist: 'Retirer de la wishlist',
    addedToWishlist: 'Ajouté à la wishlist',
    removedFromWishlist: 'Retiré de la wishlist',
    wishlistTitle: 'Wishlist',
    added: 'Produit ajouté à la wishlist',
    removed: 'Produit retiré de la wishlist',
    limitReached: 'Limite de wishlist atteinte',
    fallbackProduct: 'Produit',
  },
  en: {
    addToWishlist: 'Add to wishlist',
    removeFromWishlist: 'Remove from wishlist',
    addedToWishlist: 'Added to wishlist',
    removedFromWishlist: 'Removed from wishlist',
    wishlistTitle: 'Wishlist',
    added: 'Product added to wishlist',
    removed: 'Product removed from wishlist',
    limitReached: 'Wishlist limit reached',
    fallbackProduct: 'Product',
  },
} as const;

function toCanonicalWishlistProduct(
  product: WishlistProduct
): (WishlistItemBase & WishlistProduct) | null {
  const id = String(product?._id ?? product?.id ?? product?.slug ?? '').trim();
  if (!id) return null;
  return { ...product, id };
}

export default function WishlistButton({
  product,
  floating = true,
  className,
  disabled = false,
  stopPropagation = true,
  size = 'md',
  withLabel = false,
}: WishlistButtonProps) {
  const pathname = usePathname() || '/';
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr';
  const t = TEXT[locale];

  const prefersReduced = useReducedMotion();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [rippler, setRippler] = useState(0);
  const [shake, setShake] = useState(false);
  const [sr, setSr] = useState('');

  const { has, add, remove, count } = useWishlist<WishlistItemBase & WishlistProduct>();

  const canonical = useMemo(() => toCanonicalWishlistProduct(product), [product]);
  const pid = canonical?.id ?? '';
  const valid = pid.length > 0;
  const isWishlisted = valid ? has(pid) : false;

  const dim = size === 'sm' ? 44 : size === 'lg' ? 48 : 44;
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 22 : 20;

  const baseFloating =
    'absolute top-2 right-2 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 shadow ' +
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 ' +
    'focus-visible:ring-offset-white dark:focus-visible:ring-offset-black';

  const baseInline =
    'inline-flex items-center justify-center rounded-full text-red-600 hover:text-red-700 transition ' +
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent))]';

  useEffect(() => {
    if (!sr) return;
    const id = window.setTimeout(() => setSr(''), 1600);
    return () => window.clearTimeout(id);
  }, [sr]);

  const onToggle = () => {
    if (!valid || disabled || !canonical) return;

    try {
      navigator.vibrate?.(8);
    } catch {
      // no-op
    }

    const title = String(canonical.title ?? t.fallbackProduct);
    const price = Number(canonical.price) || 0;

    if (isWishlisted) {
      remove(pid);
      setSr(t.removed);

      toast(t.removedFromWishlist, {
        icon: <HeartCrack size={18} className="text-token-text/60" />,
        style: { borderRadius: '10px', background: 'hsl(var(--surface-2))', color: 'hsl(var(--text))' },
      });

      try {
        logEvent({
          action: 'wishlist_remove',
          category: 'wishlist',
          label: `product_${pid}`,
          value: 1,
        });
      } catch {
        // no-op
      }

      return;
    }

    if (count >= WISHLIST_LIMIT) {
      setShake(true);
      window.setTimeout(() => setShake(false), 420);
      setSr(t.limitReached);

      toast.error(t.limitReached, {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
      });

      return;
    }

    add(canonical);
    setSr(t.added);

    toast.success(t.addedToWishlist, {
      icon: <Heart size={18} className="text-red-500" />,
      style: { borderRadius: '10px', background: 'hsl(var(--surface-2))', color: 'hsl(var(--text))' },
    });

    setRippler((k) => k + 1);

    try {
      logEvent({
        action: 'wishlist_add',
        category: 'wishlist',
        label: `product_${pid}`,
        value: 1,
      });
    } catch {
      // no-op
    }

    try {
      trackAddToWishlist({
        currency: 'EUR',
        value: price,
        items: [{ item_id: pid, item_name: title, price, quantity: 1 }],
      });
    } catch {
      // no-op
    }
  };

  const ariaLabel = isWishlisted ? t.removeFromWishlist : t.addToWishlist;

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {sr}
      </span>

      <motion.button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          if (stopPropagation) {
            e.preventDefault();
            e.stopPropagation();
          }
          onToggle();
        }}
        whileTap={prefersReduced ? undefined : { scale: 0.92 }}
        animate={shake ? { x: [-3, 3, -2, 2, 0] } : undefined}
        transition={{ duration: 0.42 }}
        className={cn(
          floating ? baseFloating : baseInline,
          'relative transition-colors',
          className
        )}
        style={{ width: dim, height: dim }}
        aria-label={ariaLabel}
        aria-pressed={isWishlisted}
        disabled={!valid || disabled}
        title={ariaLabel}
        data-wishlisted={isWishlisted ? 'true' : 'false'}
      >
        {!prefersReduced && isWishlisted ? (
          <motion.span
            key={rippler}
            className="pointer-events-none absolute inset-0 rounded-full"
            initial={{ scale: 0.6, opacity: 0.35 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ boxShadow: '0 0 0 6px rgba(239,68,68,0.15)' }}
            aria-hidden
          />
        ) : null}

        {isWishlisted ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full shadow-glow-accent"
          />
        ) : null}

        <Heart
          size={iconSize}
          className={isWishlisted ? 'text-red-500' : 'text-token-text/60'}
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          aria-hidden="true"
        />

        {!floating && withLabel ? (
          <span className="ml-2 text-sm font-medium">{t.wishlistTitle}</span>
        ) : null}
      </motion.button>
    </>
  );
}
