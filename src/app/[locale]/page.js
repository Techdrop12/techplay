// src/app/[locale]/page.js

export const dynamic = 'force-dynamic';
'use client';

import SEOHead from '@/components/SEOHead';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import MotionWrapper from '@/components/MotionWrapper';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  // On récupère la fonction de traduction pour le namespace "home"
  const t = useTranslations('home');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(12);
  const sentinelRef = useRef(null);

  // Récupère produits + catégories lors du chargement du composant
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);

        if (!prodRes.ok || !catRes.ok) throw new Error();

        const productsData = await prodRes.json();
        const categoriesData = await catRes.json();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        // Utilise la clé de traduction "error_loading_products" que nous avons ajoutée
        toast.error(t('error_loading_products'));
      }
    }

    fetchData();
  }, [t]);

  // Filtre en fonction de la catégorie sélectionnée
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const visibleProducts = filteredProducts.slice(0, displayCount);

  // Infinite scroll : observe le "sentinel" pour charger 12 produits de plus
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && displayCount < filteredProducts.length) {
        setDisplayCount((prev) => prev + 12);
      }
    });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [displayCount, filteredProducts]);

  return (
    <>
      {/* Balises SEO (titre + description) */}
      <SEOHead
        titleKey="seo.homepage_title"
        descriptionKey="seo.homepage_description"
      />

      <MotionWrapper>
        {/* Carrousel en tête */}
        <HeroCarousel />

        {/* Barre de filtres catégories */}
        {categories.length > 1 && (
          <div className="flex gap-2 px-4 mt-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-sm rounded border ${
                selectedCategory === 'all' ? 'bg-black text-white' : 'bg-white'
              }`}
            >
              {t('all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-sm rounded border ${
                  selectedCategory === cat ? 'bg-black text-white' : 'bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Grille des produits */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {visibleProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/* Message si aucun produit n’est disponible */}
        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            {t('no_products_available')}
          </p>
        )}

        {/* Élément « sentinel » pour l’infinite scroll */}
        <div ref={sentinelRef} className="h-8" />
      </MotionWrapper>
    </>
  );
}
