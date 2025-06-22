// ✅ src/app/[locale]/account/commande/[id]/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';

export async function generateStaticParams() {
  return [];
}

export default async function OrderDetailPage({ params }) {
  const { locale, id } = params;
  const session = await getServerSession(authOptions);

  if (!session) redirect(`/${locale}/connexion`);

  await dbConnect();

  const order = await Order.findOne({
    _id: id,
    $or: [
      { 'user.email': session.user.email },
      { email: session.user.email },
    ],
  }).lean();

  if (!order) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <SEOHead
          overrideTitle={locale === 'fr' ? 'Commande introuvable' : 'Order Not Found'}
          overrideDescription={locale === 'fr' ? 'Impossible de charger cette commande.' : 'Could not load that order.'}
          noIndex={true}
        />
        <p className="text-gray-600">
          {locale === 'fr'
            ? 'Erreur lors du chargement de la commande.'
            : 'Error loading order.'}
        </p>
      </div>
    );
  }

  const dateString = new Date(order.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pageTitle = locale === 'fr' ? `Commande #${order._id}` : `Order #${order._id}`;
  const pageDesc =
    locale === 'fr'
      ? `Détails de la commande ${order._id} passée le ${dateString}.`
      : `Details for order ${order._id} placed on ${dateString}.`;

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || '';
  const breadcrumbSegments = [
    {
      label: locale === 'fr' ? 'Mes commandes' : 'My Orders',
      url: `${siteUrl}/${locale}/mes-commandes`,
    },
    {
      label: pageTitle,
      url: `${siteUrl}/${locale}/account/commande/${order._id}`,
    },
  ];

  return (
    <>
      <SEOHead overrideTitle={pageTitle} overrideDescription={pageDesc} breadcrumbSegments={breadcrumbSegments} />

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>

        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">
            {locale === 'fr' ? 'Informations client' : 'Customer Info'}
          </h2>
          <p><strong>{locale === 'fr' ? 'Nom :' : 'Name:'}</strong> {order.customerName || session.user.email}</p>
          <p><strong>{locale === 'fr' ? 'Email :' : 'Email:'}</strong> {order.email || session.user.email}</p>
          <p><strong>{locale === 'fr' ? 'Date :' : 'Date:'}</strong> {dateString}</p>
        </section>

        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">
            {locale === 'fr' ? 'Articles commandés' : 'Items Ordered'}
          </h2>
          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item._id} className="py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-600">
                    {item.price.toFixed(2)} € × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">
            {locale === 'fr' ? 'Résumé de la commande' : 'Order Summary'}
          </h2>
          <div className="flex justify-between mb-1">
            <span>{locale === 'fr' ? 'Sous-total :' : 'Subtotal:'}</span>
            <span>{order.subtotal?.toFixed(2) ?? '–'} €</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>{locale === 'fr' ? 'Frais de livraison :' : 'Shipping:'}</span>
            <span>{order.shipping?.toFixed(2) ?? '–'} €</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>{locale === 'fr' ? 'Total :' : 'Total:'}</span>
            <span>{order.total?.toFixed(2) ?? '–'} €</span>
          </div>
        </section>

        <section className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">
            {locale === 'fr' ? 'Statut de la commande' : 'Order Status'}
          </h2>
          <p className={`inline-block px-2 py-1 text-sm rounded ${
            order.status === 'en cours'
              ? 'bg-yellow-100 text-yellow-700'
              : order.status === 'expédiée'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {order.status}
          </p>
        </section>
      </div>
    </>
  );
}
