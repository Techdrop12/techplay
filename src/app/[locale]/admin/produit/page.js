'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import SEOHead from '@/components/SEOHead';

export default function AdminProduitsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('admin');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
      router.push('/');
    } else {
      fetch('/api/admin/products')
        .then((res) => res.json())
        .then(setProducts)
        .catch(() => toast.error('Erreur de chargement des produits'));
    }
  }, [status, session]);

  const deleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-2fa': process.env.NEXT_PUBLIC_ADMIN_2FA_CODE || '' },
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Produit supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (status === 'loading') return <p>Chargement...</p>;

  return (
    <>
      <SEOHead
        overrideTitle={t('dashboard')}
        overrideDescription="Gestion des produits TechPlay"
      />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🛠️ {t('dashboard')}</h1>
          <Link
            href={`/fr/admin/produit/ajouter`}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            ➕ {t('add_product')}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">{t('no_products_available') || 'Aucun produit.'}</p>
        ) : (
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p._id} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-gray-500">
                    {p.price} € – {p.category || 'Sans catégorie'}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link
                    href={`/fr/admin/produit/${p._id}`}
                    className="text-blue-600 underline"
                  >
                    Modifier
                  </Link>
                  <button onClick={() => deleteProduct(p._id)} className="text-red-600">
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
