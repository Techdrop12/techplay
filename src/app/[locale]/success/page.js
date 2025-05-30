export const dynamic = 'force-dynamic'
'use client'

import { useTranslations } from 'next-intl'
import SEOHead from '@/components/SEOHead'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/cartContext'
import Link from 'next/link'
import Confetti from 'react-confetti'

export default function SuccessPage() {
  const t = useTranslations('success')
  const { clearCart } = useCart()

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    clearCart()
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [clearCart])

  return (
    <>
      <SEOHead
        titleKey="seo.success_title"
        descriptionKey="seo.success_description"
      />

      <Confetti width={windowSize.width} height={windowSize.height} />

      <div className="p-6 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        <p className="mb-6">{t('message')}</p>

        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:opacity-90"
        >
          {t('back')}
        </Link>
      </div>
    </>
  )
}
