import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-32">
      <h1 className="text-3xl font-bold mb-4">Page introuvable</h1>
      <p className="mb-6">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link href="/" className="text-blue-600 hover:underline">Retour à l’accueil</Link>
    </div>
  );
}
