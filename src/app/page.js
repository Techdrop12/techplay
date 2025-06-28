// ✅ /src/app/page.js (full option landing, SEO, hero, CTA)
import Link from 'next/link';
import SEOHead from '@/components/SEOHead';
import HeroCarousel from '@/components/HeroCarousel';
import FreeShippingBar from '@/components/FreeShippingBar';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  return (
    <>
      <SEOHead
        overrideTitle="TechPlay – Boutique High Tech, Gadgets & Accessoires"
        overrideDescription="Découvrez les meilleurs gadgets et accessoires high-tech livrés chez vous. Livraison rapide, service premium, nouveautés chaque semaine !"
      />
      <FreeShippingBar />
      <HeroCarousel />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">
          Bienvenue chez TechPlay&nbsp;!
        </h1>
        <p className="mb-4 text-lg text-gray-600">
          Explorez nos dernières innovations high-tech, sélectionnées pour améliorer votre quotidien.
        </p>
        <Link
          href="/fr/produit"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition"
        >
          Voir tous les produits
        </Link>
        <HomeClient />
      </main>
    </>
  );
}
