// ✅ src/app/[locale]/not-found.js (404 UX/SEO, version premium)
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">404 – Page introuvable</h1>
      <p className="text-gray-500 mb-6 max-w-lg">
        Oups, la page que vous recherchez semble introuvable.
        Elle a peut-être été déplacée ou supprimée.
      </p>
      <Link
        href="/"
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
      >
        Retour à l’accueil
      </Link>
    </div>
  );
}
