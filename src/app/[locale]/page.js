'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

import SEOHead from '@/components/SEOHead';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import MotionWrapper from '@/components/MotionWrapper';

export default function HomeClient() {
  const tSeo = useTranslations('seo');
  const tHome = useTranslations('home');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(12);
  const sentinelRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Erreur API');
        const data = await res.json();
        setProducts(data);

        // Extraction unique des tags (catégories dynamiques)
        const allTags = data.flatMap((p) => p.tags || []);
        const uniqueCategories = Array.from(new Set(allTags));
        setCategories(uniqueCategories);
      } catch {
        toast.error(tHome('error_loading_products'));
      }
    }
    fetchData();
  }, [tHome]);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.tags?.includes(selectedCategory));

  // Protection slice + fallback
  const visibleProducts = filteredProducts?.slice(0, displayCount) || [];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        displayCount < filteredProducts.length
      ) {
        setDisplayCount((prev) => prev + 12);
      }
    });
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [displayCount, filteredProducts]);

  return (
    <>
      <SEOHead
        titleKey="homepage_title"
        descriptionKey="homepage_description"
      />

      <MotionWrapper>
        <HeroCarousel />

        {categories.length > 1 && (
          <div className="flex gap-2 px-4 mt-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {tHome('all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-sm rounded border transition-colors ${
                  selectedCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {visibleProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            {tHome('no_products_available')}
          </p>
        )}

        <div ref={sentinelRef} className="h-8" />
      </MotionWrapper>
    </>
  );
}
