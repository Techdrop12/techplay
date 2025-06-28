// ✅ /src/app/[locale]/cgv/page.js (page CGV, SEO, UX)
import SEOHead from '@/components/SEOHead';

export default function CGVPage() {
  return (
    <>
      <SEOHead
        overrideTitle="Conditions Générales de Vente"
        overrideDescription="Consultez nos CGV – vos achats sur TechPlay en toute transparence et confiance."
      />
      <main className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Conditions Générales de Vente</h1>
        <p className="text-gray-600 mb-4">
          Voici nos CGV, à adapter selon votre statut auto-entrepreneur/dropshipping, etc.<br />
          (Remplacez ce contenu par vos CGV personnalisées)
        </p>
        <div className="prose">
          <ul>
            <li>Droit de rétractation 14 jours</li>
            <li>Livraison offerte dès 49 € d’achats</li>
            <li>SAV réactif – contact en 24h</li>
            <li>Garanties & remboursement</li>
          </ul>
        </div>
      </main>
    </>
  );
}
