// ✅ src/app/success/page.js

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1 className="text-2xl font-bold text-green-700 mb-2">Merci pour votre commande !</h1>
      <p className="mb-4 text-gray-700">
        Votre achat a bien été pris en compte.<br />
        Vous recevrez un email de confirmation dans quelques instants.
      </p>
      <Link href="/" className="text-blue-600 hover:underline">Retour à l’accueil</Link>
    </div>
  );
}
