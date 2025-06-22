// ✅ src/app/[locale]/mes-commandes/page.js

export const dynamic = 'force-dynamic'; // ← 🔥 Ajout clé pour éviter le plantage Vercel

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import SEOHead from '@/components/SEOHead';


export default async function OrdersPage({ params }) {
  const { locale } = params;
  const session = await getServerSession(authOptions);

  if (!session) redirect(`/${locale}/connexion`);

  await dbConnect();

  const orders = await Order.find({
    $or: [
      { 'user.email': session.user.email },
      { email: session.user.email }
    ]
  }).sort({ createdAt: -1 }).lean();

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || '';

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Mes commandes' : 'My Orders'}
        overrideDescription={locale === 'fr'
          ? 'Consultez l’historique de vos commandes passées sur TechPlay.'
          : 'View your past order history on TechPlay.'}
        breadcrumbSegments={[
          {
            label: locale === 'fr' ? 'Mes commandes' : 'My Orders',
            url: `${siteUrl}/${locale}/mes-commandes`
          }
        ]}
      />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr' ? 'Mes commandes' : 'My Orders'}
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-600">
            {locale === 'fr'
              ? 'Vous n’avez passé aucune commande pour le moment.'
              : 'You have not placed any orders yet.'}
          </p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const date = new Date(order.createdAt).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              const total = order.total?.toFixed(2) ?? '–';

              return (
                <li key={order._id} className="border rounded p-4 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {locale === 'fr' ? 'Commande' : 'Order'} #{order._id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {locale === 'fr' ? 'Passée le' : 'Placed on'} {date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{total} €</p>
                      <p className={`text-sm ${
                        order.status === 'en cours'
                          ? 'text-yellow-600'
                          : order.status === 'expédiée'
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/${locale}/account/commande/${order._id}`}
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    {locale === 'fr' ? 'Voir les détails' : 'View details'}
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
