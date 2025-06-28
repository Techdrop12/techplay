// ✅ /src/app/[locale]/success/page.js (remerciement après paiement)
import SEOHead from '@/components/SEOHead';

export default function SuccessPage() {
  return (
    <>
      <SEOHead
        overrideTitle="Paiement réussi"
        overrideDescription="Votre commande TechPlay est validée. Merci pour votre achat !"
      />
      <main className="max-w-xl mx-auto py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Paiement réussi ✅</h1>
        <p className="text-lg text-gray-600 mb-8">
          Merci pour votre achat sur TechPlay.<br />
          Un email de confirmation vous a été envoyé.
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
