'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { toast } from 'react-hot-toast';

import type { Product } from '@/types/product';

import Button from '@/components/Button';
import { useCart } from '@/hooks/useCart';
import { flyTo, spawnRipple } from '@/lib/animations';
import { detectCurrency } from '@/lib/currency';
import { trackAddToCart as rawTrackAddToCart } from '@/lib/ga';
import { logEvent as rawLogEvent } from '@/lib/logEvent';
import {
  pixelAddToCart as rawPixelAddToCart,
  pixelInitiateCheckout as rawPixelInitiateCheckout,
} from '@/lib/meta-pixel';

type MinimalProduct = Pick<Product, '_id' | 'slug' | 'title' | 'image' | 'price'>;

interface Props {
  product: MinimalProduct & { quantity?: number };
  onAdd?: () => void;
  onError?: (err: unknown) => void;

  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'glass';
  withIcon?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  stopPropagation?: boolean;

  haptic?: boolean;
  ripple?: boolean;
  flyToCart?: boolean;
  flyToCartSelector?: string;
  scrollToStickyOnMobile?: boolean;
  afterAddFocus?: 'none' | 'cart' | 'button';

  pendingText?: string;
  successText?: string;
  idleText?: string;
  debounceMs?: number;
  ariaLabel?: string;

  disableDataLayer?: boolean;
  gtmExtra?: Record<string, unknown>;

  instantCheckout?: boolean;
  locale?: string;
}

type AnyFn = (...args: unknown[]) => unknown;
type CartAddPayload = {
  _id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

type CartHookLike = {
  addToCart?: unknown;
};

type WindowWithDataLayer = Window & {
  dataLayer?: Array<Record<string, unknown>>;
};

function canUseDOM(): boolean {
  return typeof window !== 'undefined';
}

function isFunction(value: unknown): value is AnyFn {
  return typeof value === 'function';
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function getDataLayer(): Array<Record<string, unknown>> | null {
  if (!canUseDOM()) return null;
  const w = window as WindowWithDataLayer;
  if (!Array.isArray(w.dataLayer)) w.dataLayer = [];
  return w.dataLayer;
}

function pushToDataLayer(payload: Record<string, unknown>): void {
  try {
    const dl = getDataLayer();
    dl?.push(payload);
  } catch {}
}

function safeCall(fn: unknown, ...args: unknown[]): unknown {
  if (!isFunction(fn)) return undefined;
  try {
    return fn(...args);
  } catch {
    return undefined;
  }
}


const Spinner = () => (
  <svg className="mr-2 -ml-0.5 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeOpacity="0.25"
      strokeWidth="4"
      fill="none"
    />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const CartIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M7 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4M6.2 6l.63 3H20a1 1 0 0 1 .98 1.2l-1.2 6A2 2 0 0 1 17.83 16H9a2 2 0 0 1-1.96-1.6L5 4H3a1 1 0 0 1 0-2h2.72a1 1 0 0 1 .98.8L7 6z"
    />
  </svg>
);

const CheckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M9.55 16.6L5.3 12.35l1.4-1.4l2.85 2.85L17.3 6.95l1.4 1.4z" />
  </svg>
);

export default function AddToCartButton({
  product,
  onAdd,
  onError,

  size = 'md',
  variant = 'solid',
  withIcon = true,
  fullWidth = true,
  className,
  disabled = false,
  stopPropagation = false,

  haptic = true,
  ripple = true,
  flyToCart = true,
  flyToCartSelector = "[data-cart-icon], a[href$='/commande']",
  scrollToStickyOnMobile = true,
  afterAddFocus = 'none',

  pendingText = 'Ajout en cours…',
  successText = 'Produit ajouté au panier',
  idleText,
  debounceMs = 350,
  ariaLabel,

  disableDataLayer = false,
  gtmExtra,

  instantCheckout = false,
  locale = 'fr',
}: Props) {
  const tCart = useTranslations('cart');
  const router = useRouter();
  const cartApi = useCart() as CartHookLike;
  const addToCartFn = isFunction(cartApi?.addToCart) ? cartApi.addToCart : null;

  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [srMessage, setSrMessage] = useState('');

  const prefersReduced = useReducedMotion();
  const lastClickRef = useRef<number>(0);
  const labelId = useId();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const currency = useMemo(() => detectCurrency(), []);

  const sizeClasses = useMemo(() => {
    if (size === 'sm') return 'px-3 py-2 text-sm rounded-lg';
    if (size === 'lg') return 'px-6 py-5 text-lg rounded-2xl';
    return 'px-4 py-4 text-base rounded-xl';
  }, [size]);

  const variantClasses = useMemo(() => {
    if (variant === 'outline') {
      return 'bg-transparent text-[hsl(var(--accent))] border border-[hsl(var(--accent)/.4)] hover:bg-[hsl(var(--accent)/.08)]';
    }
    if (variant === 'glass') {
      return 'bg-white/15 text-white border border-white/20 backdrop-blur-md hover:bg-white/20 dark:bg-zinc-900/30 dark:border-white/10';
    }
    return 'bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent)/.90)]';
  }, [variant]);

  const doDataLayerPush = useCallback(
    (detail: {
      id: string;
      title: string;
      price: number;
      quantity: number;
      value: number;
      slug: string;
    }) => {
      if (disableDataLayer) return;

      pushToDataLayer({
        event: 'add_to_cart',
        ecommerce: {
          currency,
          value: detail.value,
          items: [
            {
              item_id: detail.id,
              item_name: detail.title,
              price: detail.price,
              quantity: detail.quantity,
              slug: detail.slug,
            },
          ],
        },
        ...(gtmExtra ?? {}),
      });
    },
    [disableDataLayer, gtmExtra, currency]
  );

  const focusCartIcon = useCallback(() => {
    if (!canUseDOM()) return;
    try {
      const target = document.querySelector<HTMLElement>(flyToCartSelector);
      target?.focus?.();
    } catch {}
  }, [flyToCartSelector]);

  const handleClick = useCallback(
    async (e?: ReactMouseEvent) => {
      if (stopPropagation && e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (loading || disabled) return;

      const now = Date.now();
      if (now - lastClickRef.current < Math.max(0, debounceMs)) return;
      lastClickRef.current = now;

      const id = String(product?._id ?? '');
      const slug = String(product?.slug ?? '');
      const title = String(product?.title ?? 'Produit');
      const image = String(product?.image ?? '/fallback.png');
      const price = Number(product?.price ?? 0);
      const quantity = clamp(Math.trunc(Number(product?.quantity ?? 1)), 1, 99);

      if (!id) {
        const err = new Error("Produit invalide — impossible d'ajouter au panier");
        toast.error(err.message);
        onError?.(err);
        return;
      }

      if (!addToCartFn) {
        const err = new Error('Fonction panier indisponible');
        toast.error(err.message);
        onError?.(err);
        return;
      }

      setLoading(true);

      try {
        const payload: CartAddPayload = {
          _id: id,
          slug,
          title,
          image,
          price,
          quantity,
        };

        await Promise.resolve(addToCartFn(payload));

        safeCall(rawLogEvent, {
          action: 'add_to_cart',
          category: 'ecommerce',
          label: title,
          value: price * quantity,
        });

        safeCall(rawTrackAddToCart, {
          currency,
          value: price * quantity,
          items: [{ item_id: id, item_name: title, price, quantity }],
          ...(gtmExtra?.ab_name && gtmExtra?.ab_variant
            ? { ab_experiment: String(gtmExtra.ab_name), ab_variant: String(gtmExtra.ab_variant) }
            : {}),
        });

        safeCall(rawPixelAddToCart, {
          value: price * quantity,
          currency,
          contents: [{ id, quantity, item_price: price }],
        });

        doDataLayerPush({
          id,
          title,
          price,
          quantity,
          value: price * quantity,
          slug,
        });

        if (haptic && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(prefersReduced ? 10 : [8, 12, 8]);
          } catch {}
        }

        if (flyToCart && canUseDOM() && wrapperRef.current) {
          const target = document.querySelector<HTMLElement>(flyToCartSelector);
          if (target) flyTo(wrapperRef.current, target, !!prefersReduced);
        }

        toast.success(successText, {
          duration: 2400,
          position: 'top-right',
        });

        setSrMessage(`${title} ajouté au panier`);
        setAdded(true);

        if (scrollToStickyOnMobile && canUseDOM() && window.innerWidth < 768) {
          const sticky =
            document.querySelector<HTMLElement>('aside[role="region"][data-visible="true"]') ??
            document.querySelector<HTMLElement>('aside[role="region"]');
          sticky?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }

        if (canUseDOM()) {
          try {
            window.dispatchEvent(
              new CustomEvent('cart-added', {
                detail: { id, title, price, quantity, slug },
              })
            );
          } catch {}
        }

        if (afterAddFocus === 'cart') focusCartIcon();
        if (afterAddFocus === 'button') wrapperRef.current?.focus?.();

        onAdd?.();

        if (instantCheckout) {
          safeCall(rawLogEvent, {
            action: 'buy_now_click',
            category: 'ecommerce',
            label: title,
          });

          if (!disableDataLayer) {
            pushToDataLayer({
              event: 'buy_now_click',
              ...(gtmExtra ?? {}),
            });
          }

          safeCall(rawPixelInitiateCheckout, {
            value: price * quantity,
            currency,
            num_items: 1,
            contents: [{ id, quantity, item_price: price }],
          });

          const normalizedLocale = locale || 'fr';
          const path = `/${normalizedLocale}/commande`;

          try {
            router.push(path);
          } catch {
            if (canUseDOM()) window.location.href = path;
          }
        }
      } catch (err: unknown) {
        toast.error(tCart('add_to_cart_error'));
        onError?.(err);
      } finally {
        window.setTimeout(() => setLoading(false), 420);
        window.setTimeout(() => setSrMessage(''), 1800);
        window.setTimeout(() => setAdded(false), 1200);
      }
    },
    [
      stopPropagation,
      loading,
      disabled,
      debounceMs,
      product,
      addToCartFn,
      haptic,
      prefersReduced,
      flyToCart,
      flyToCartSelector,
      successText,
      scrollToStickyOnMobile,
      afterAddFocus,
      onAdd,
      onError,
      doDataLayerPush,
      instantCheckout,
      locale,
      router,
      currency,
      disableDataLayer,
      gtmExtra,
      focusCartIcon,
      tCart,
    ]
  );

  const idleLabel = idleText ?? tCart('add_to_cart');

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srMessage}
      </span>

      <motion.div
        ref={wrapperRef}
        whileTap={prefersReduced ? undefined : { scale: 0.96 }}
        className={fullWidth ? 'w-full' : undefined}
        tabIndex={afterAddFocus === 'button' ? -1 : undefined}
      >
        <Button
          type="button"
          onMouseDown={(e) => {
            if (!prefersReduced && ripple && canUseDOM()) spawnRipple(e);
          }}
          onClick={handleClick}
          {...(ariaLabel ? { 'aria-label': ariaLabel } : { 'aria-labelledby': labelId })}
          aria-disabled={loading || disabled ? true : undefined}
          aria-busy={loading ? 'true' : 'false'}
          data-loading={loading ? 'true' : 'false'}
          data-qty={product.quantity ?? 1}
          data-product-id={product._id}
          data-action="add-to-cart"
          data-price={product.price}
          disabled={loading || disabled}
          className={[
            fullWidth ? 'w-full' : '',
            'font-extrabold shadow-lg transition-colors active:scale-95 focus:outline-none focus-visible:ring-4',
            'focus-visible:ring-[hsl(var(--accent)/.55)]',
            variantClasses,
            sizeClasses,
            loading || disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
            added ? 'ring-4 ring-emerald-400/40' : '',
            className ?? '',
          ].join(' ')}
        >
          <span id={labelId} className="inline-flex items-center gap-2">
            {loading && <Spinner />}
            {!loading && withIcon && !added && <CartIcon className="-ml-0.5" />}
            {!loading && added && <CheckIcon className="-ml-0.5 text-emerald-400" />}
            {loading ? pendingText : added ? 'Ajouté' : idleLabel}
          </span>
        </Button>
      </motion.div>
    </>
  );
}
