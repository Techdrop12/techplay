import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="bg-black text-white py-16 px-6 text-center rounded-2xl mt-16">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à découvrir nos meilleurs produits ?</h2>
      <p className="text-lg mb-8">Qualité, fiabilité et design réunis. Ne ratez pas nos packs exclusifs.</p>
      <Link href="/products" className="inline-block bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition">
        Explorer la boutique
      </Link>
    </section>
  );
}
