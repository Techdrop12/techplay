// File: src/app/[locale]/mes-commandes/page.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { createTranslator } from 'next-intl/server';
import SEOHead from '@/components/SEOHead';
import Link from 'next/link';

export default async function MesCommandesPage({ params: { locale } }) {
  // 1) Récupérer la session côté serveur
  const session = await getServerSession(authOptions);

  // 2) Si pas de session, rediriger vers /[locale]/connexion
  if (!session) {
    redirect(`/${locale}/connexion`);
  }

  // 3) Récupérer les commandes de l’utilisateur
  let orders = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/user/orders`, {
      headers: {
        // Transmettre le cookie de session pour que l’API puisse authentifier
        cookie: `next-auth.session-token=${session.user.id || ''}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Erreur lors du chargement des commandes');
    }
    orders = await res.json();
  } catch (err) {
    console.error('fetch orders error:', err);
    orders = [];
  }

  // 4) Traductions côté serveur
  let t;
  try {
    t = createTranslator(locale, 'orders');
  } catch {
    // Si le namespace “orders” manque pour cette locale, on peut afficher un fallback minimal
    // ou 404, mais ici on continue avec un traducteur “vide” qui affichera uniquement clés brutes.
    t = (key) => key;
  }

  return (
    <>
      <SEOHead
        titleKey="orders_title"
        descriptionKey="orders_description"
      />

      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('my_orders')}</h1>

        {orders.length === 0 ? (
          <p className="text-gray-500">{t('no_orders_found')}</p>
        ) : (
          <ul className="divide-y border rounded">
            {orders.map((order) => (
              <li key={order._id} className="p-4 flex justify-between">
                <div>
                  <p className="font-semibold">{order._id}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <p className="font-medium">{order.total.toFixed(2)} €</p>
                <Link
                  href={`/${locale}/commande/${order._id}`}
                  className="text-blue-600 underline"
                >
                  {t('view_details')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
