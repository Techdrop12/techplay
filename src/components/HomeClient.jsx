// src/components/HomeClient.jsx
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

import SEOHead from '@/components/SEOHead';
import HeroCarousel from '@/components/HeroCarousel';
import ProductCard from '@/components/ProductCard';
import MotionWrapper from '@/components/MotionWrapper';

/**
 * Composant client pour la Home.
 * ('use client' indique à Next qu’on peut utiliser hooks React ici)
 */
export default function HomeClient() {
  // Clés i18n pour la partie SEO
  const tSeo = useTranslations('seo');
  // Clés i18n pour tout le reste de la home (texte, boutons, etc.)
  const tHome = useTranslations('home');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(12);
  const sentinelRef = useRef(null);

  // Au montage, on fetch la liste des produits et catégories
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        if (!prodRes.ok || !catRes.ok) throw new Error('Erreur API');
        const productsData = await prodRes.json();
        const categoriesData = await catRes.json();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch {
        // Si erreur lors du fetch, affichage d’un toast i18n
        toast.error(tHome('error_loading_products'));
      }
    }
    fetchData();
  }, [tHome]);

  // Filtrage par catégorie
  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  // On affiche les X premiers produits (infinite scroll)
  const visibleProducts = filteredProducts.slice(0, displayCount);

  // On observe la div « sentinel » pour détecter si on arrive en bas de la liste
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        displayCount < filteredProducts.length
      ) {
        // Ajouter 12 produits supplémentaires
        setDisplayCount((prev) => prev + 12);
      }
    });
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [displayCount, filteredProducts]);

  return (
    <>
      {/*
        Insertion de la balise <head> avec titre + description tirés de i18n (seo.homepage_*)
      */}
      <SEOHead
        titleKey="homepage_title"
        descriptionKey="homepage_description"
      />

      <MotionWrapper>
        {/* Carrousel de type Hero (full-width, animé, etc.) */}
        <HeroCarousel />

        {/*
          Si on a au moins 2 catégories (autre que “all”), on affiche
          un bandeau horizontal de boutons de filtre
        */}
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

        {/*
          Grille responsive des produits :
          2 colonnes sur mobile, 3 sur petit écran, 4 sur grand écran
        */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {visibleProducts.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>

        {/*
          Si, après filtrage, il n’y a aucun produit à afficher :
          on affiche un message “Aucun produit disponible”.
        */}
        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            {tHome('no_products_available')}
          </p>
        )}

        {/* Div d’intersession pour l’infinite-scroll */}
        <div ref={sentinelRef} className="h-8" />
      </MotionWrapper>
    </>
  );
}
