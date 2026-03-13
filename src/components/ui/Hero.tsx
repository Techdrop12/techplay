import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-20 px-6 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
            Boostez votre quotidien avec <span className="text-blue-600">TechPlay</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Gadgets, accessoires et innovations tech – livraison rapide, SAV premium.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="/fr/categorie/populaire"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Voir les nouveautés
            </a>
            <a
              href="/fr/a-propos"
              className="border px-6 py-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              En savoir plus
            </a>
          </div>
        </div>
        <div className="flex-1 relative w-full h-64 md:h-96">
          <Image
            src="/hero-tech.webp"
            alt="TechPlay Hero"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
