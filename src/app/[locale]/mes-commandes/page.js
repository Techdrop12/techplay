// src/app/[locale]/mes-commandes/page.js

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import Link from 'next/link';

/**
 * Page “Mes commandes” (Server Component).
 * 1) Extraire locale de params
 * 2) Récupérer la session côté serveur
 * 3) Si pas de session, rediriger vers /[locale]/connexion
 * 4) Récupérer les commandes depuis l’API interne
 * 5) Charger le namespace "orders"
 * 6) Passer à SEOHead + afficher la liste
 */
export default async function MesCommandesPage({ params }) {
  // 1) Extraire locale directement
  const { locale } = params;

  // 2) Récupérer la session côté serveur
  const session = await getServerSession(authOptions);

  // 3) Si pas de session, rediriger vers /[locale]/connexion
  if (!session) {
    redirect(`/${locale}/connexion`);
  }

  // 4) Charger les commandes de l’utilisateur (API interne)
  let orders = [];
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/user/orders`, {
      headers: {
        // Transmettre le cookie pour authentifier l’API
        cookie: `next-auth.session-token=${session.user.id || ''}`,
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Erreur lors du chargement des commandes');
    orders = await res.json();
  } catch (err) {
    console.error('fetch orders error:', err);
    orders = [];
  }

  // 5) Charger le JSON global (fr.json ou en.json)
  let allMessages;
  try {
    allMessages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    allMessages = {};
  }

  // 6) Extraire le namespace "orders"
  const namespace = allMessages['orders'] ?? {};
  const t = (key) => namespace[key] ?? key;

  // 7) Construire les segments de breadcrumb pour JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const basePath = `${siteUrl}/${locale}`;
  const breadcrumbSegments = [
    { label: t('my_orders'), url: `${basePath}` },
    { label: t('my_orders'), url: `${basePath}/mes-commandes` },
  ];

  return (
    <>
      <SEOHead
        titleKey="orders_title"
        descriptionKey="orders_description"
        breadcrumbSegments={breadcrumbSegments}
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
