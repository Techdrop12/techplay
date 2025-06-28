// ✅ /src/app/[locale]/contact/page.js (formulaire contact, SEO, accessibilité)
import SEOHead from '@/components/SEOHead';

export default function ContactPage() {
  return (
    <>
      <SEOHead
        overrideTitle="Contact – Service client TechPlay"
        overrideDescription="Une question ? Contactez le support TechPlay via notre formulaire ou par email : contact@techplay.fr."
      />
      <main className="max-w-lg mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Contactez-nous</h1>
        <form
          action="mailto:contact@techplay.fr"
          method="POST"
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
          >
            Envoyer
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-500">
          Ou contactez-nous par email : <a href="mailto:contact@techplay.fr" className="underline">contact@techplay.fr</a>
        </p>
      </main>
    </>
  );
}
