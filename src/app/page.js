// 📁 /src/app/page.js
'use client'
import { useEffect, useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import HeroCarousel from '@/components/HeroCarousel'
import ProductCard from '@/components/ProductCard'

export default function HomePage() {
  const t = useTranslations('home')
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOption, setSortOption] = useState('none')
  const itemsPerLoad = 12
  const [displayCount, setDisplayCount] = useState(itemsPerLoad)
  const sentinelRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ])
      const products = await pRes.json()
      const categories = await cRes.json()
      setProducts(products)
      setCategories(categories)
    }
    fetchData()
  }, [])

  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price
    if (sortOption === 'price-desc') return b.price - a.price
    return 0
  })

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setDisplayCount(prev => prev + itemsPerLoad)
      }
    })
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="p-4">
      <HeroCarousel />
      <div className="flex gap-2 my-4">
        <input
          type="text"
          placeholder={t('search')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select value={sortOption} onChange={e => setSortOption(e.target.value)} className="border p-2 rounded">
          <option value="none">{t('sort.none')}</option>
          <option value="price-asc">{t('sort.priceAsc')}</option>
          <option value="price-desc">{t('sort.priceDesc')}</option>
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sorted.slice(0, displayCount).map(p => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      <div ref={sentinelRef}></div>
    </div>
  )
}
