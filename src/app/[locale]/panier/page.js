'use client'

import { useTranslations } from 'next-intl'
import { useCart } from '@/context/cartContext'
import SEOHead from '@/components/SEOHead'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

// ⚠️ À activer uniquement si tu l’utilises
// import UpsellBlock from '@/components/UpsellBlock'

export default function PanierPage() {
  const t = useTranslations('cart')
  const { cart, total } = useCart()
  const router = useRouter()

  const FREE_SHIPPING_THRESHOLD = 60
  const progressPercent = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const missing = Math.max(0, FREE_SHIPPING_THRESHOLD - total).toFixed(2)

  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      })

      const data = await res.json()
      if (data.url) router.push(data.url)
      else throw new Error()
    } catch (err) {
      toast.error(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEOHead titleKey="seo.cart_title" descriptionKey="seo.cart_description" />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{t('your_cart')}</h1>

        <AnimatePresence>
          {cart.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-500"
            >
              {t('empty')}
            </motion.p>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm mb-1">
                  {progressPercent >= 100
                    ? "✅ Livraison gratuite atteinte !"
                    : `Ajoutez encore ${missing} € pour obtenir la livraison offerte.`}
                </p>
                <div className="w-full h-3 bg-gray-200 rounded">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className="h-3 bg-green-500 rounded"
                  />
                </div>
              </div>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="divide-y border rounded mb-6"
              >
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
              </motion.ul>

              <div className="text-right mb-6">
                <p className="text-lg font-bold">{t('total')}: {total.toFixed(2)} €</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="bg-black text-white px-6 py-3 rounded hover:opacity-90 w-full"
              >
                {loading ? 'Redirection...' : t('checkout')}
              </button>

              <Link
                href="/"
                className="block mt-4 text-sm text-center text-blue-600 underline"
              >
                {t('continue')}
              </Link>

              {/* ❌ Commenté si pas utilisé */}
              {/* <UpsellBlock /> */}
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
