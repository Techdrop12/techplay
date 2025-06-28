// ✅ /src/app/[locale]/commande/page.js (confirmation commande, tracking)
import SEOHead from '@/components/SEOHead';

export default function CommandePage() {
  return (
    <>
      <SEOHead
        overrideTitle="Confirmation de commande"
        overrideDescription="Votre commande a bien été enregistrée sur TechPlay. Merci pour votre confiance !"
      />
      <main className="max-w-xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Merci pour votre commande !</h1>
        <p className="text-lg text-gray-600 mb-8">
          Vous recevrez un email de confirmation avec le suivi.<br />
          Notre équipe prépare votre colis avec soin.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Retour à l’accueil
        </a>
      </main>
    </>
  );
}
