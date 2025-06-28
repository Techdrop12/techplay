// ✅ /src/app/[locale]/a-propos/page.js (about us, SEO, trust)
import SEOHead from '@/components/SEOHead';

export default function AboutPage() {
  return (
    <>
      <SEOHead
        overrideTitle="À propos de TechPlay"
        overrideDescription="Découvrez la mission, l’équipe et les valeurs de TechPlay, boutique high-tech."
      />
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-4">À propos de TechPlay</h1>
        <p className="text-gray-700 mb-4">
          TechPlay est né de la passion pour la technologie et l’innovation. Notre équipe sélectionne chaque produit avec exigence, pour vous offrir les gadgets les plus utiles et innovants du marché.
        </p>
        <ul className="list-disc ml-8 mb-6 text-gray-700">
          <li>Livraison rapide &amp; sécurisée</li>
          <li>Garantie satisfait ou remboursé</li>
          <li>Support client réactif</li>
        </ul>
        <p className="text-gray-600">Merci de votre confiance !</p>
      </div>
    </>
  );
}
