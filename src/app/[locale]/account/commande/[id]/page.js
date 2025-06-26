// ✅ src/app/[locale]/account/commande/[id]/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import SEOHead from '@/components/SEOHead';

export default async function CommandeDetailPage({ params }) {
  const { id, locale } = params;
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
      <div className="p-6 max-w-2xl mx-auto text-center text-red-500">
        {locale === 'fr' ? 'Commande introuvable ou accès refusé.' : 'Order not found or access denied.'}
      </div>
    );
  }

  const date = new Date(order.createdAt).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const total = order.total?.toFixed(2) ?? '–';

  return (
    <>
      <SEOHead overrideTitle={`Commande #${order._id}`} overrideDescription="Détail de la commande client" />
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-2">
          {locale === 'fr' ? 'Commande' : 'Order'} #{order._id}
        </h1>
        <p className="text-gray-600 mb-4">
          {locale === 'fr' ? 'Passée le' : 'Placed on'} {date}
        </p>
        <div className="mb-4">
          <strong>{locale === 'fr' ? 'Statut' : 'Status'} : </strong>
          <span className={`px-2 py-1 rounded text-sm ${
            order.status === 'en cours'
              ? 'bg-yellow-100 text-yellow-700'
              : order.status === 'expédiée'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {order.status}
          </span>
        </div>
        <div className="mb-4">
          <strong>{locale === 'fr' ? 'Total' : 'Total'} : </strong>
          {total} €
        </div>
        <h2 className="font-semibold mb-2">{locale === 'fr' ? 'Produits' : 'Products'}</h2>
        <ul className="mb-4">
          {order.items?.map((item) => (
            <li key={item._id} className="border-b py-2 flex justify-between">
              <span>{item.title} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)} €</span>
            </li>
          ))}
        </ul>
        {order.trackingUrl && (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 text-blue-600 underline"
          >
            {locale === 'fr' ? 'Suivre la livraison' : 'Track shipment'}
          </a>
        )}
      </div>
    </>
  );
}
