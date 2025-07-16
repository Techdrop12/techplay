import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Bienvenue chez TechPlay</h1>
      <p className="text-lg max-w-2xl mx-auto mb-6">
        Découvrez les meilleurs gadgets high-tech et accessoires innovants. Livraison rapide. SAV premium.
      </p>
      <Link href="/fr#produits" className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition">
        Explorer les produits
      </Link>
    </section>
  );
}
