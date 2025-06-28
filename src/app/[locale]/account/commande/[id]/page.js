// ✅ /src/app/[locale]/account/commande/[id]/page.js (suivi commande, tracking, SEO, badge livraison)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import SEOHead from '@/components/SEOHead';
import FreeShippingBadge from '@/components/FreeShippingBadge';

export default async function CommandeDetailPage({ params }) {
  const { id, locale } = params;
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/${locale}/connexion`);

  await dbConnect();
  const order = await Order.findOne({
    _id: id,
    $or: [
      { 'user.email': session.user.email },
      { email: session.user.email }
    ]
  }).lean();

  if (!order) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-2">Commande introuvable</h2>
        <p className="text-gray-600">Impossible d’accéder à cette commande.</p>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? `Commande #${order._id}` : `Order #${order._id}`}
        overrideDescription={locale === 'fr' ? 'Détail et suivi de votre commande.' : 'Order details and tracking.'}
      />
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto my-10">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr' ? 'Commande' : 'Order'} #{order._id}
        </h1>
        <p className="mb-2 text-gray-600">
          {locale === 'fr' ? 'Statut' : 'Status'} : <span className="font-semibold">{order.status}</span>
        </p>
        <p className="mb-2 text-gray-600">
          {locale === 'fr' ? 'Date' : 'Date'} : {new Date(order.createdAt).toLocaleString(locale)}
        </p>
        <FreeShippingBadge price={order.total} />
        <div className="mt-6">
          <h2 className="font-semibold mb-2">{locale === 'fr' ? 'Produits commandés' : 'Ordered products'}</h2>
          <ul className="divide-y">
            {order.items.map((item, i) => (
              <li key={i} className="py-2 flex justify-between">
                <span>{item.title} × {item.qty}</span>
                <span>{item.price?.toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <span className="font-bold">{locale === 'fr' ? 'Total' : 'Total'} : {order.total?.toFixed(2)} €</span>
          <span className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-700">{order.status}</span>
        </div>
        <div className="mt-8 text-center">
          <a
            href={`mailto:support@techplay.fr?subject=Commande ${order._id}`}
            className="text-blue-600 underline hover:text-blue-800"
          >
            {locale === 'fr' ? 'Besoin d’aide ? Contactez le support' : 'Need help? Contact support'}
          </a>
        </div>
      </div>
    </>
  );
}
