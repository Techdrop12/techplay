// ✅ src/app/[locale]/not-found.js

import SEOHead from '@/components/SEOHead';

export default function NotFound() {
  // Impossible de récupérer locale ici sur tous les contextes, donc page neutre (multi-locale)
  return (
    <>
      <SEOHead
        overrideTitle="Page introuvable"
        overrideDescription="La page demandée n’existe pas sur TechPlay."
        noIndex
      />
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <svg width={60} height={60} fill="none" className="mb-4" viewBox="0 0 24 24">
          <circle cx={12} cy={12} r={12} fill="#fbbf24" />
          <text x="12" y="18" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="bold">
            404
          </text>
        </svg>
        <h1 className="text-xl font-bold mb-2 text-yellow-700">Oups…</h1>
        <p className="text-gray-600 mb-2">
          La page demandée n’existe pas ou n’est plus disponible.
        </p>
        <a
          href="/fr"
          className="text-blue-600 hover:underline font-semibold mt-2"
        >
          Retour à l’accueil
        </a>
      </div>
    </>
  );
}
