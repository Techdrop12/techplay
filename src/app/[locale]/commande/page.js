// ✅ src/app/[locale]/commande/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import SEOHead from '@/components/SEOHead';

export default async function CommandePage({ params }) {
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

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Mes commandes' : 'My Orders'}
        overrideDescription={
          locale === 'fr'
            ? 'Consultez vos commandes passées sur TechPlay.'
            : 'See your past orders on TechPlay.'
        }
      />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr' ? 'Mes commandes' : 'My Orders'}
        </h1>
        {orders.length === 0 ? (
          <p className="text-gray-600">
            {locale === 'fr'
              ? 'Vous n’avez passé aucune commande.'
              : 'You haven’t placed any orders.'}
          </p>
        ) : (
          <ul className="divide-y">
            {orders.map(order => (
              <li key={order._id} className="py-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">#{order._id.toString().slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-600">
                      {locale === 'fr' ? 'Date :' : 'Date:'}{' '}
                      {new Date(order.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{order.total?.toFixed(2) ?? '–'} €</p>
                    <p className={`text-sm ${order.status === 'en cours'
                      ? 'text-yellow-700'
                      : order.status === 'expédiée'
                      ? 'text-blue-700'
                      : 'text-green-700'}`}>
                      {order.status}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
