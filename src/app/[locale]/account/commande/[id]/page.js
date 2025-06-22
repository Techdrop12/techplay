// ✅ src/app/[locale]/account/commande/page.js

export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

let BreadcrumbJsonLd = () => null;
try {
  BreadcrumbJsonLd = require('@/components/JsonLd/BreadcrumbJsonLd').default;
} catch (e) {
  console.warn('BreadcrumbJsonLd non chargé :', e.message);
}

export default async function OrdersPage({ params }) {
  const { locale } = params;
  const session = await getServerSession(authOptions);

  if (!session) redirect(`/${locale}/connexion`);

  await dbConnect();

  const orders = await Order.find({
    $or: [
      { 'user.email': session.user.email },
      { email: session.user.email },
    ],
  }).sort({ createdAt: -1 }).lean();

  const pageTitle = locale === 'fr' ? 'Mes commandes' : 'My Orders';
  const pageDesc = locale === 'fr'
    ? 'Historique de vos commandes passées sur TechPlay.'
    : 'Your order history on TechPlay.';

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || '';

  return (
    <>
      <SEOHead overrideTitle={pageTitle} overrideDescription={pageDesc} />
      <BreadcrumbJsonLd
        pathSegments={[
          {
            label: pageTitle,
            url: `${siteUrl}/${locale}/account/commande`,
          },
        ]}
      />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>

        {orders.length === 0 ? (
          <p className="text-gray-600">
            {locale === 'fr'
              ? 'Vous n’avez passé aucune commande pour le moment.'
              : 'You have not placed any orders yet.'}
          </p>
        ) : (
          <ul className="divide-y">
            {orders.map((order) => {
              const date = new Date(order.createdAt).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              const total = order.total?.toFixed(2) ?? '–';

              return (
                <li key={order._id} className="py-4">
                  <a
                    href={`/${locale}/account/commande/${order._id}`}
                    className="block hover:bg-gray-100 p-4 rounded border"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          #{order._id.toString().slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {locale === 'fr' ? 'Date :' : 'Date:'} {date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{total} €</p>
                        <p className={`text-sm inline-block px-2 py-1 rounded ${
                          order.status === 'en cours'
                            ? 'bg-yellow-100 text-yellow-700'
                            : order.status === 'expédiée'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
