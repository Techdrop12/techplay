// ✅ /src/app/[locale]/not-found.js (404 UX/SEO)
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">404 – Page introuvable</h1>
      <p className="text-gray-500 mb-6">
        Oups, la page demandée n’existe pas.<br />
        Retournez à l’accueil ou explorez nos produits.
      </p>
      <a
        href="/"
