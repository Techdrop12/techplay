// ✅ src/app/[locale]/contact/page.js

import SEOHead from '@/components/SEOHead';

export default function ContactPage({ params }) {
  const { locale } = params;
  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Contactez-nous' : 'Contact us'}
        overrideDescription={
          locale === 'fr'
            ? 'Une question ? Contactez TechPlay via le formulaire.'
            : 'Have a question? Contact TechPlay via this form.'
        }
      />
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr' ? 'Contactez-nous' : 'Contact us'}
        </h1>
        <form
          action="/api/contact"
          method="POST"
          className="space-y-4"
        >
          <div>
            <label className="block mb-1">
              {locale === 'fr' ? 'Nom' : 'Name'}
            </label>
            <input type="text" name="name" required className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">
              {locale === 'fr' ? 'Email' : 'Email'}
            </label>
            <input type="email" name="email" required className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">
              {locale === 'fr' ? 'Message' : 'Message'}
            </label>
            <textarea name="message" required rows={4} className="border rounded px-3 py-2 w-full" />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition"
          >
            {locale === 'fr' ? 'Envoyer' : 'Send'}
          </button>
        </form>
        <div className="mt-6 text-gray-600 text-sm">
          {locale === 'fr'
            ? "Ou contactez-nous par email à contact@techplay.fr"
            : "Or contact us by email at contact@techplay.fr"}
        </div>
      </div>
    </>
  );
}
