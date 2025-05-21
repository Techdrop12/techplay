'use client'

import { useTranslations } from 'next-intl'
import { useCart } from '@/context/cartContext'
import SEOHead from '@/components/SEOHead'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PanierPage() {
  const t = useTranslations('cart')
  const { cart, total } = useCart()
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      })

      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch (err) {
      alert(t('error'))
    }
  }

  return (
    <>
      <SEOHead
        titleKey="seo.cart_title"
        descriptionKey="seo.cart_description"
      />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('your_cart')}</h1>

        {cart.length === 0 ? (
          <p>{t('empty')}</p>
        ) : (
          <>
            <ul className="divide-y border rounded mb-6">
              {cart.map((item, i) => (
                <li key={i} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.price} € x {item.quantity}</p>
                  </div>
                  <p className="text-right font-medium">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </li>
              ))}
            </ul>

            <div className="text-right mb-6">
              <p className="text-lg font-bold">{t('total')}: {total.toFixed(2)} €</p>
            </div>

            <button
              onClick={handleCheckout}
              className="bg-black text-white px-6 py-3 rounded hover:opacity-90 w-full"
            >
              {t('checkout')}
            </button>

            <Link
              href="/"
              className="block mt-4 text-sm text-center text-blue-600 underline"
            >
              {t('continue')}
            </Link>
          </>
        )}
      </div>
    </>
  )
}
