// File: src/app/[locale]/produit/[slug]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

import SEOHead from '@/components/SEOHead';
import ProductCard from '@/components/ProductCard';
import ScoreTracker from '@/components/ScoreTracker';
import FreeShippingBadge from '@/components/FreeShippingBadge';
import WishlistButton from '@/components/WishlistButton';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import RecentProducts from '@/components/RecentProducts';
import ProductJsonLd from '@/components/ProductJsonLd';
import BreadcrumbJsonLd from '@/components/JsonLd/BreadcrumbJsonLd';
import { addRecentProduct } from '@/lib/recentProducts';

export default function ProductPage() {
  const { slug } = useParams();
  const locale = useLocale(); // “fr” ou “en”
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState('A');
  const [recommendations, setRecommendations] = useState([]);

  // 1) Choix aléatoire de la variante A/B
  useEffect(() => {
    setVariant(Math.random() < 0.5 ? 'A' : 'B');
  }, []);

  // 2) Fetch du produit
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Produit introuvable');
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch(() => toast.error('Erreur lors du chargement du produit'));
  }, [slug]);

  // 3) Dès que le produit est dispo, fetch recommandations et ajouter aux récents
  useEffect(() => {
    if (!product) return;

    fetch(
      `/api/recommendations?category=${encodeURIComponent(
        product.category
      )}&excludeIds=${product._id}`
    )
      .then((res) => {
        if (!res.ok) throw new Error('Erreur recommandations');
        return res.json();
      })
      .then(setRecommendations)
      .catch(() => toast.error('Erreur chargement recommandations'));

    addRecentProduct({
      slug: product.slug,
      name: product.title,
      price: product.price,
      image: product.image,
    });
  }, [product]);

  // 4) Si on n’a pas encore le produit, placeholder “chargement”
  if (!product) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center text-sm text-gray-500 animate-pulse">
        Chargement du produit en cours...
      </div>
    );
  }

  // 5) Construire l’URL canonique avec le bon segment de locale
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || '';

  const canonicalUrl = `${baseUrl}/${locale}/produit/${product.slug}`;

  // 6) Breadcrumb pour JSON-LD (on met la locale en dur dans ce tableau)
  const breadcrumbSegments = [
    { label: locale === 'fr' ? 'Accueil' : 'Home', url: `${baseUrl}/${locale}` },
    {
      label: product.category,
      url: `${baseUrl}/${locale}/categorie/${product.category}`,
    },
    { label: product.title, url: canonicalUrl },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto p-6"
    >
      <ScoreTracker />

      {/*
        SEOHead “full-option” :
        • overrideTitle = titre exact du produit
        • product = objet complet (pour JSON-LD)
        • image = URL de l’image produit
        • url = URL canonique (avec segment de locale)
        • breadcrumbSegments = [ { label, url }, … ] pour JSON-LD du fil d’Ariane
      */}
      <SEOHead
        overrideTitle={product.title}
        product={product}
        image={product.image}
        url={canonicalUrl}
        breadcrumbSegments={breadcrumbSegments}
      />

      {/* JSON-LD pour un produit */}
      <ProductJsonLd product={product} />

      <div className="flex items-start justify-between gap-2 mb-4">
        <h1 className="text-3xl font-bold">
          {variant === 'A'
            ? product.title
            : `${product.title} – Édition Limitée`}
        </h1>
        <WishlistButton product={product} />
      </div>

      <ProductCard product={product} variant={variant} />
      <FreeShippingBadge price={product.price} />

      {variant === 'B' && (
        <p className="mt-4 text-sm text-green-600 font-semibold">
          🎁 Offre spéciale sur cette version !
        </p>
      )}

      <div className="mt-8">
        <ReviewForm productId={product._id} />
        <ReviewList productId={product._id} />
      </div>

      {recommendations.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">
            {locale === 'fr' ? 'Produits recommandés' : 'Recommended products'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <ProductCard key={rec._id} product={rec} />
            ))}
          </div>
        </section>
      )}

      <RecentProducts />
    </motion.div>
  );
}
