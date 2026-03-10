'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

import { useCart } from '@/hooks/useCart'
import { createCheckoutSession } from '@/lib/checkout'
import { event as gaEvent, trackAddShippingInfo, pushDataLayer } from '@/lib/ga'
import { pixelInitiateCheckout } from '@/lib/meta-pixel'

type FormErrors = { email?: string; address?: string }

type CartItemLike = {
  _id?: string
  slug?: string
  sku?: string
  title?: string
  name?: string
  brand?: string
  category?: string
  variant?: string
  price?: number
  quantity?: number
}

type CheckoutSessionResult = {
  url?: string
}

const LS_EMAIL_KEY = 'checkout_email'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

const isEmail = (v: string) => EMAIL_RE.test(String(v || '').trim())
const isAddress = (v: string) => String(v || '').trim().length >= 6
const joinIds = (...ids: Array<string | undefined>) => ids.filter(Boolean).join(' ')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function toStringSafe(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function getCartItems(input: unknown): CartItemLike[] {
  if (!Array.isArray(input)) return []

  return input.map((item) => {
    if (!isRecord(item)) return {}

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
    }
  })
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  if (isRecord(err) && typeof err.message === 'string' && err.message.trim()) return err.message
  return 'Une erreur est survenue. Réessayez.'
}

function detectCurrency(): 'EUR' | 'GBP' | 'USD' {
  try {
    const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang || '' : ''
    const nav = typeof navigator !== 'undefined' ? navigator.language || '' : ''
    const src = (htmlLang || nav).toLowerCase()

    if (src.includes('gb') || src.endsWith('-uk') || src.includes('en-gb')) return 'GBP'
    if (src.includes('us') || src.includes('en-us')) return 'USD'
    if (src.startsWith('en')) return 'USD'
    return 'EUR'
  } catch {
    return 'EUR'
  }
}

function IconCard({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M3 6.5C3 5.12 4.12 4 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-11Z" fill="currentColor" opacity="0.12" />
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="5" y="9" width="14" height="2.25" rx="1" fill="currentColor" />
      <rect x="5" y="14" width="5.5" height="1.75" rx="0.9" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export default function CheckoutForm() {
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState('')
  const [hp, setHp] = useState('')
  const [currency, setCurrency] = useState<'EUR' | 'GBP' | 'USD'>(() => detectCurrency())

  const formRef = useRef<HTMLFormElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const addressRef = useRef<HTMLInputElement | null>(null)
  const srRef = useRef<HTMLParagraphElement | null>(null)

  const emailHintId = useId()
  const addressHintId = useId()
  const srStatusId = useId()

  const { cart } = useCart()

  const { subtotal, itemsCount, gaItems, pixelContents } = useMemo(() => {
    const items = getCartItems(cart)

    const subtotal = items.reduce(
      (sum, item) => sum + toNumber(item.price, 0) * Math.max(1, toNumber(item.quantity, 1)),
      0
    )

    const itemsCount = items.reduce(
      (sum, item) => sum + Math.max(1, toNumber(item.quantity, 1)),
      0
    )

    const gaItems = items.map((item) => {
      const quantity = Math.max(1, toNumber(item.quantity, 1))
      const price = toNumber(item.price, 0)

      return {
        item_id: item._id || item.slug || item.sku || 'unknown-item',
        item_name: item.title || item.name || 'Produit',
        price,
        quantity,
        item_brand: item.brand || undefined,
        item_category: item.category || undefined,
        item_variant: item.variant || undefined,
      }
    })

    const pixelContents = items.map((item) => ({
      id: item._id || item.slug || item.sku || 'unknown-item',
      quantity: Math.max(1, toNumber(item.quantity, 1)),
      item_price: toNumber(item.price, 0),
    }))

    return { subtotal, itemsCount, gaItems, pixelContents }
  }, [cart])

  useEffect(() => {
    try {
      const qsEmail = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('email')
        : null

      if (qsEmail && isEmail(qsEmail)) {
        setEmail(qsEmail)
        try {
          gaEvent?.({ action: 'checkout_prefill_email_qs', category: 'checkout', label: 'querystring' })
          pushDataLayer?.({ event: 'checkout_prefill_email_qs' })
        } catch {}
        return
      }

      const saved = localStorage.getItem(LS_EMAIL_KEY)
      if (saved && isEmail(saved)) {
        setEmail(saved)
        try {
          gaEvent?.({ action: 'checkout_prefill_email_ls', category: 'checkout', label: 'localstorage' })
          pushDataLayer?.({ event: 'checkout_prefill_email_ls' })
        } catch {}
      }
    } catch {}
  }, [])

  useEffect(() => {
    setCurrency(detectCurrency())
  }, [])

  const announce = useCallback((msg: string) => {
    setStatus(msg)
    if (srRef.current) srRef.current.textContent = msg
  }, [])

  const validate = useCallback((): boolean => {
    const next: FormErrors = {}

    if (!isEmail(email)) next.email = 'Adresse email invalide'
    if (!isAddress(address)) next.address = 'Adresse trop courte'

    setErrors(next)

    if (next.email) {
      emailRef.current?.focus()
      return false
    }

    if (next.address) {
      addressRef.current?.focus()
      return false
    }

    return true
  }, [address, email])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (loading) return
      if (hp) return
      if (!validate()) return

      setLoading(true)
      setStatus('')
      formRef.current?.setAttribute('aria-busy', 'true')

      try {
        try {
          trackAddShippingInfo({
            currency,
            value: subtotal,
            items: gaItems,
            shipping_tier: 'standard',
          })
        } catch {}

        try {
          pushDataLayer?.({
            event: 'add_shipping_info',
            currency,
            value: subtotal,
            ecommerce: {
              currency,
              value: subtotal,
              items: gaItems,
              shipping_tier: 'standard',
            },
          })
        } catch {}

        try {
          pixelInitiateCheckout?.({
            currency,
            value: subtotal || undefined,
            num_items: itemsCount || undefined,
            contents: pixelContents,
          })
        } catch {}

        try {
          localStorage.setItem(LS_EMAIL_KEY, email)
        } catch {}

        announce('Création de la session de paiement…')

        const session = (await createCheckoutSession({
          email,
          address,
          currency,
          locale:
            typeof document !== 'undefined'
              ? (document.documentElement.lang || 'fr').slice(0, 2)
              : 'fr',
        })) as CheckoutSessionResult | null | undefined

        if (session && typeof session.url === 'string' && session.url) {
          toast('Redirection vers le paiement…', {
            icon: <IconCard className="text-[hsl(var(--accent))]" />,
          })
          announce('Redirection vers Stripe')

          try {
            pushDataLayer?.({
              event: 'checkout_redirect',
              provider: 'stripe_checkout',
              currency,
            })
          } catch {}

          window.location.href = session.url
          return
        }

        throw new Error('Session invalide')
      } catch (err: unknown) {
        const msg = getErrorMessage(err)
        console.error('[Checkout] error:', err)
        announce(msg)
        toast.error('Une erreur est survenue. Veuillez réessayer.')

        try {
          pushDataLayer?.({ event: 'checkout_error', message: msg })
        } catch {}
      } finally {
        setLoading(false)
        formRef.current?.setAttribute('aria-busy', 'false')
      }
    },
    [address, announce, currency, email, gaItems, hp, itemsCount, loading, pixelContents, subtotal, validate]
  )

  const onEmailBlur = useCallback(() => {
    if (!isEmail(email)) return
    try {
      localStorage.setItem(LS_EMAIL_KEY, email)
    } catch {}
  }, [email])

  const onEmailKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter' || !isEmail(email)) return
      e.preventDefault()
      addressRef.current?.focus()
    },
    [email]
  )

  const emailDescribedBy = joinIds(errors.email ? 'email-error' : undefined, emailHintId)
  const addressDescribedBy = joinIds(errors.address ? 'address-error' : undefined, addressHintId)

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      aria-labelledby="checkout-form-title"
      aria-describedby={srStatusId}
    >
      <p
        id={srStatusId}
        ref={srRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </p>

      <h3 id="checkout-form-title" className="text-lg font-semibold text-gray-900 dark:text-white">
        Coordonnées
      </h3>

      <fieldset disabled={loading} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            enterKeyHint="next"
            className={[
              'w-full border px-3 py-2 rounded-lg text-sm',
              'bg-white dark:bg-zinc-800',
              'focus:outline-none focus:ring-2',
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-zinc-700 focus:ring-accent',
            ].join(' ')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            onBlur={onEmailBlur}
            onKeyDown={onEmailKeyDown}
            required
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-required="true"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={emailDescribedBy || undefined}
            placeholder="vous@exemple.com"
            maxLength={120}
            data-gtm="checkout_email_input"
          />
          <p id={emailHintId} className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Nous vous enverrons la confirmation et la facture à cette adresse.
          </p>
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600" role="alert" aria-live="assertive">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            Adresse de livraison
          </label>
          <input
            ref={addressRef}
            id="address"
            name="street-address"
            type="text"
            className={[
              'w-full border px-3 py-2 rounded-lg text-sm',
              'bg-white dark:bg-zinc-800',
              'focus:outline-none focus:ring-2',
              errors.address
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-zinc-700 focus:ring-accent',
            ].join(' ')}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value)
              if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }))
            }}
            required
            autoComplete="shipping street-address"
            aria-required="true"
            aria-invalid={errors.address ? 'true' : 'false'}
            aria-describedby={addressDescribedBy || undefined}
            placeholder="12 rue des Fleurs, 75000 Paris"
            maxLength={160}
            data-gtm="checkout_address_input"
          />
          <p id={addressHintId} className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Numéro et libellé de rue, code postal, ville.
          </p>
          {errors.address && (
            <p id="address-error" className="mt-1 text-xs text-red-600" role="alert" aria-live="assertive">
              {errors.address}
            </p>
          )}
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Site web</label>
          <input
            id="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-4 rounded-xl shadow transition disabled:opacity-60 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
          disabled={loading}
          aria-busy={loading ? 'true' : 'false'}
          data-gtm="checkout_submit_btn"
        >
          {loading ? 'Redirection…' : 'Payer maintenant'}
        </button>

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          En continuant, vous acceptez nos <a className="underline" href="/cgv">CGV</a> et notre{' '}
          <a className="underline" href="/confidentialite">politique de confidentialité</a>.
        </p>
      </fieldset>
    </form>
  )
}