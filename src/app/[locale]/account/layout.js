// ✅ src/app/[locale]/account/layout.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function AccountLayout({ children, params }) {
  const session = await getServerSession(authOptions);
  const { locale } = params;
  if (!session) {
    redirect(`/${locale}/connexion`);
  }
  return (
    <section className="max-w-4xl mx-auto p-4">
      <nav className="mb-6 flex gap-4 text-sm border-b pb-2">
        <a href={`/${locale}/account/commande`} className="hover:underline">Mes commandes</a>
        <a href={`/${locale}/wishlist`} className="hover:underline">Wishlist</a>
        {/* Ajoutez d'autres liens compte si besoin */}
      </nav>
      {children}
    </section>
  );
}
