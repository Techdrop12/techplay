'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import SEOHead from '@/components/SEOHead';

export default function AdminProduitsPage() {
  const t = useTranslations('admin');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then(setProducts)
      .catch(() => toast.error('Erreur de chargement des produits'));
  }, []);

  const deleteProduct = async (id) => {
    if (confirm('Supprimer ce produit ?')) {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success('Produit supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <>
      <SEOHead
        overrideTitle={t('dashboard')}
        overrideDescription="Gestion des produits TechPlay"
      />
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🛠️ {t('dashboard')}</h1>

        <div className="mb-6">
          <Link
            href="/fr/admin/produit/ajouter"
            className="bg-green-600 text-white px-4 py-2 rounded text-sm"
          >
            ➕ {t('add_product')}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500">{t('no_products_available') || 'Aucun produit pour le moment.'}</p>
        ) : (
          <ul className="space-y-3">
            {products.map((p) => (
              <li
                key={p._id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-gray-500">{p.price} € – {p.category || 'Sans catégorie'}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link
                    href={`/fr/admin/produit/${p._id}`}
                    className="text-blue-600 underline"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="text-red-600"
                  >
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
