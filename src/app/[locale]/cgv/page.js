// File: src/app/[locale]/cgv/page.js
'use client';

import SEOHead from '@/components/SEOHead';

export default function CGVPage() {
  return (
    <>
      <SEOHead
        overrideTitle="Conditions Générales de Vente"
        overrideDescription="Toutes les conditions générales de vente de TechPlay."
      />
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Conditions Générales de Vente
        </h1>
        <p className="text-gray-700">
          Les présentes conditions s'appliquent à toutes les commandes effectuées
          sur le site TechPlay.
        </p>
        {/* Ajoutez ici le contenu complet de vos CGV */}
      </div>
    </>
  );
}
