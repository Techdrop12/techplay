'use client'

import SEOHead from '@/components/SEOHead'
import { useTranslations } from 'next-intl'
import { useEffect, useState, useRef } from 'react'
import HeroCarousel from '../../components/HeroCarousel'
import ProductCard from '../../components/ProductCard'
import MotionWrapper from '@/components/MotionWrapper'

export default function HomePage() {
  const t = useTranslations('home')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [displayCount, setDisplayCount] = useState(12)
  const sentinelRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ])
      const productsData = await prodRes.json()
      const categoriesData = await catRes.json()
      setProducts(productsData)
      setCategories(categoriesData)
    }
    fetchData()
  }, [])

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory)

  const visibleProducts = filteredProducts.slice(0, displayCount)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayCount < filteredProducts.length) {
        setDisplayCount((prev) => prev + 12)
      }
    })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [displayCount, filteredProducts])

  return (
    <>
      <SEOHead
        titleKey="seo.homepage_title"
        descriptionKey="seo.homepage_description"
      />

      <MotionWrapper>
        <HeroCarousel />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {visibleProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
        <div ref={sentinelRef} className="h-8" />
      </MotionWrapper>
    </>
  )
}
