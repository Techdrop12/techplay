'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import ErrorWithRetry from '@/components/ui/ErrorWithRetry';
import Link from '@/components/LocalizedLink';
import { useCart } from '@/hooks/useCart';
import { createCheckoutSession } from '@/lib/checkout';
import { detectCurrency } from '@/lib/currency';
import { getErrorMessageWithFallback } from '@/lib/errors';
import { event as gaEvent, pushDataLayer, trackAddShippingInfo } from '@/lib/ga';
import { error as logError } from '@/lib/logger';
import { pixelInitiateCheckout } from '@/lib/meta-pixel';
import { cn, formatPrice, intlLocaleForStoreRoute } from '@/lib/utils';

type FormErrors = {
  email?: string;
  address?: string;
};

type CartItemLike = {
  _id?: string;
  slug?: string;
  sku?: string;
  title?: string;
  name?: string;
  brand?: string;
  category?: string;
  variant?: string;
  price?: number;
  quantity?: number;
};

type CheckoutSessionResult = {
  url?: string;
};

const LS_EMAIL_KEY = 'checkout_email';
const LS_ADDRESS_KEY = 'checkout_address';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const isEmail = (value: string) => EMAIL_RE.test(String(value || '').trim());
const isAddress = (value: string) => String(value || '').trim().length >= 6;

function joinIds(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStringSafe(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getCartItems(input: unknown): CartItemLike[] {
  if (!Array.isArray(input)) return [];

  return input.map((item) => {
    if (!isRecord(item)) return {};

    return {
      _id: toStringSafe(item._id),
      slug: toStringSafe(item.slug),
      sku: toStringSafe(item.sku),
      title: toStringSafe(item.title),
      name: toStringSafe(item.name),
      brand: toStringSafe(item.brand),
      category: toStringSafe(item.category),
      variant: toStringSafe(item.variant),
      price: toNumber(item.price, 0),
      quantity: Math.max(1, Math.trunc(toNumber(item.quantity, 1))),
    };
  });
}

function IconCard({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M3 6.5C3 5.12 4.12 4 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11Z"
        fill="currentColor"
        opacity="0.12"
      />
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect x="5" y="9" width="14" height="2.25" rx="1" fill="currentColor" />
      <rect x="5" y="14" width="5.5" height="1.75" rx="0.9" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export default function CheckoutForm() {
  const t = useTranslations('checkout');
  const routeLocale = useLocale();
  const checkoutPriceLocale = useMemo(
    () => intlLocaleForStoreRoute(routeLocale),
    [routeLocale]
  );
  const { cart } = useCart();

  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'GBP' | 'USD'>(() => detectCurrency());
  const [lastError, setLastError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const statusRef = useRef<HTMLParagraphElement | null>(null);

  const emailHintId = useId();
  const addressHintId = useId();
  const statusId = useId();

  const { subtotal, itemsCount, gaItems, pixelContents } = useMemo(() => {
    const items = getCartItems(cart);

    const subtotal = items.reduce(
      (sum, item) => sum + toNumber(item.price, 0) * Math.max(1, toNumber(item.quantity, 1)),
      0
    );

    const itemsCount = items.reduce(
      (sum, item) => sum + Math.max(1, toNumber(item.quantity, 1)),
      0
    );

    const gaItems = items.map((item) => {
      const quantity = Math.max(1, toNumber(item.quantity, 1));
      const price = toNumber(item.price, 0);

      return {
        item_id: item._id || item.slug || item.sku || 'unknown-item',
        item_name: item.title || item.name || 'Produit',
        price,
        quantity,
        item_brand: item.brand || undefined,
        item_category: item.category || undefined,
        item_variant: item.variant || undefined,
      };
    });

    const pixelContents = items.map((item) => ({
      id: item._id || item.slug || item.sku || 'unknown-item',
      quantity: Math.max(1, toNumber(item.quantity, 1)),
      item_price: toNumber(item.price, 0),
    }));

    return { subtotal, itemsCount, gaItems, pixelContents };
  }, [cart]);

  useEffect(() => {
    try {
      const searchParams =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

      const queryEmail = searchParams?.get('email');
      if (queryEmail && isEmail(queryEmail)) {
        setEmail(queryEmail);
        return;
      }

      const storedEmail = localStorage.getItem(LS_EMAIL_KEY);
      if (storedEmail && isEmail(storedEmail)) {
        setEmail(storedEmail);
      }

      const storedAddress = localStorage.getItem(LS_ADDRESS_KEY);
      if (storedAddress && isAddress(storedAddress)) {
        setAddress(storedAddress);
      }
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    setCurrency(detectCurrency());
  }, []);

  const announce = useCallback((message: string) => {
    setStatus(message);
    if (statusRef.current) {
      statusRef.current.textContent = message;
    }
  }, []);

  const validate = useCallback(() => {
    const nextErrors: FormErrors = {};

    if (!isEmail(email)) nextErrors.email = t('validation_email');
    if (!isAddress(address)) nextErrors.address = t('validation_address');

    setErrors(nextErrors);

    if (nextErrors.email) {
      emailRef.current?.focus();
      return false;
    }

    if (nextErrors.address) {
      addressRef.current?.focus();
      return false;
    }

    return true;
  }, [address, email, t]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (loading) return;
      if (honeypot) return;
      setLastError(null);
      if (!gaItems.length) {
        toast.error(t('cart_empty_toast'));
        return;
      }
      if (!validate()) return;

      setLoading(true);
      setStatus('');
      formRef.current?.setAttribute('aria-busy', 'true');

      try {
        try {
          trackAddShippingInfo({
            currency,
            value: subtotal,
            items: gaItems,
            shipping_tier: 'standard',
          });
        } catch {
          // no-op
        }

        try {
          pushDataLayer({
            event: 'add_shipping_info',
            currency,
            value: subtotal,
            ecommerce: {
              currency,
              value: subtotal,
              items: gaItems,
              shipping_tier: 'standard',
            },
          });
        } catch {
          // no-op
        }

        try {
          pixelInitiateCheckout?.({
            currency,
            value: subtotal || undefined,
            num_items: itemsCount || undefined,
            contents: pixelContents,
          });
        } catch {
          // no-op
        }

        try {
          localStorage.setItem(LS_EMAIL_KEY, email.trim());
          localStorage.setItem(LS_ADDRESS_KEY, address.trim());
        } catch {
          // no-op
        }

        try {
          gaEvent?.({
            action: 'checkout_submit',
            category: 'checkout',
            label: 'begin_checkout',
            value: subtotal,
          });
        } catch {
          // no-op
        }

        announce(t('creating_session_announce'));

        const session = (await createCheckoutSession({
          email: email.trim(),
          address: address.trim(),
          currency,
          locale:
            typeof document !== 'undefined'
              ? (document.documentElement.lang || 'fr').slice(0, 2)
              : 'fr',
        })) as CheckoutSessionResult | null | undefined;

        if (session?.url) {
          toast(t('redirect_toast'), {
            icon: <IconCard className="text-[hsl(var(--accent))]" />,
          });

          announce(t('redirect_announce'));

          try {
            pushDataLayer({
              event: 'checkout_redirect',
              provider: 'stripe_checkout',
              currency,
            });
          } catch {
            // no-op
          }

          window.location.href = session.url;
          return;
        }

        throw new Error('Session de paiement invalide');
      } catch (error: unknown) {
        const message = getErrorMessageWithFallback(error, 'Une erreur est survenue. Réessayez.');

        logError('[Checkout] error:', error);
        setLastError(message);
        announce(message);
        toast.error(message);

        try {
          pushDataLayer({
            event: 'checkout_error',
            message,
          });
        } catch {
          // no-op
        }
      } finally {
        setLoading(false);
        formRef.current?.setAttribute('aria-busy', 'false');
      }
    },
    [
      address,
      announce,
      currency,
      email,
      gaItems,
      honeypot,
      itemsCount,
      loading,
      pixelContents,
      subtotal,
      t,
      validate,
    ]
  );

  const handleEmailBlur = useCallback(() => {
    if (!isEmail(email)) return;
    try {
      localStorage.setItem(LS_EMAIL_KEY, email.trim());
    } catch {
      // no-op
    }
  }, [email]);

  const emailDescribedBy = joinIds(errors.email ? 'email-error' : undefined, emailHintId);
  const addressDescribedBy = joinIds(errors.address ? 'address-error' : undefined, addressHintId);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      aria-labelledby="checkout-form-title"
      aria-describedby={statusId}
    >
      <p
        id={statusId}
        ref={statusRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </p>

      {/* En-tête tunnel : étape + réassurance */}
      <div className="rounded-xl bg-[hsl(var(--surface-2))]/60 px-4 py-3">
        <p
          id="checkout-form-title"
          className="text-lg font-bold tracking-tight text-[hsl(var(--text))]"
        >
          {t('coords_heading')}
        </p>
        <p className="mt-1 text-[13px] text-token-text/70">{t('coords_intro')}</p>
        <p className="mt-2 text-[12px] text-token-text/60" aria-hidden="true">
          {t('secure_note')}
        </p>
      </div>

      <fieldset disabled={loading} className="space-y-6">
        <div>
          <label
            htmlFor="checkout-email"
            className="mb-1 block text-[13px] font-medium text-[hsl(var(--text))]"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="checkout-email"
            name="email"
            type="email"
            inputMode="email"
            enterKeyHint="next"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            onBlur={handleEmailBlur}
            required
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={t('email_placeholder')}
            maxLength={120}
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={emailDescribedBy || undefined}
            data-gtm="checkout_email_input"
            className={cn(
              'w-full min-h-[3rem] rounded-xl border-2 px-3.5 py-3 text-[14px] transition sm:min-h-0',
              'bg-[hsl(var(--surface))]/90 dark:bg-[hsl(var(--surface))]/70',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]',
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]'
            )}
          />
          <p id={emailHintId} className="mt-1 text-[11px] text-token-text/60">
            {t('email_hint')}
          </p>
          {errors.email ? (
            <p id="email-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="checkout-address"
            className="mb-1 block text-[13px] font-medium text-[hsl(var(--text))]"
          >
            {t('shipping_label')}
          </label>
          <textarea
            ref={addressRef}
            id="checkout-address"
            name="street-address"
            rows={3}
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              if (errors.address) {
                setErrors((prev) => ({ ...prev, address: undefined }));
              }
            }}
            required
            autoComplete="shipping street-address"
            placeholder={t('address_placeholder')}
            maxLength={220}
            aria-required="true"
            aria-invalid={errors.address ? 'true' : 'false'}
            aria-describedby={addressDescribedBy || undefined}
            data-gtm="checkout_address_input"
            className={cn(
              'min-h-[4.5rem] w-full resize-y rounded-xl border-2 px-3.5 py-3 text-[14px] transition sm:min-h-[96px]',
              'bg-[hsl(var(--surface))]/90 dark:bg-[hsl(var(--surface))]/70',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]',
              errors.address
                ? 'border-red-500 focus:ring-red-500'
                : 'border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]'
            )}
          />
          <p id={addressHintId} className="mt-1 text-[11px] text-token-text/60">
            {t('address_hint')}
          </p>
          {errors.address ? (
            <p id="address-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.address}
            </p>
          ) : null}
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">{t('website_label')}</label>
          <input
            id="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading ? 'true' : 'false'}
          data-gtm="checkout_submit_btn"
          className={cn(
            'btn-premium w-full justify-center rounded-xl text-[15px] font-bold',
            'min-h-[3.25rem] px-4 py-3.5',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
        >
          {loading ? (
            <span
              className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
          ) : (
            <IconCard />
          )}
          <span>
            {loading
              ? t('redirecting_btn')
              : t('pay_btn') + ' ' + formatPrice(subtotal, { currency, locale: checkoutPriceLocale })}
          </span>
        </button>

        {lastError && (
          <ErrorWithRetry
            message={lastError}
            onRetry={() => {
              setLastError(null);
              emailRef.current?.focus();
            }}
            retryLabel={t('retry_btn')}
          />
        )}

        <p className="text-center text-[11px] text-token-text/60" role="status">
          {t('secure_footer_prefix')}
          <Link className="underline underline-offset-1" href="/cgv">
            {t('link_cgv')}
          </Link>
          {t('secure_footer_mid')}
          <Link className="underline underline-offset-1" href="/confidentialite">
            {t('privacy_link')}
          </Link>
          {t('secure_footer_suffix')}
        </p>
      </fieldset>
    </form>
  );
}
