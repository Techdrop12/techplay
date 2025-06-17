'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/admin/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        toast.error('Erreur chargement produits');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Confirmer la suppression de ce produit ?');
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur suppression');
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Produit supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <p className="text-center">Chargement...</p>;

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Produits en base</h2>
      <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-300">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 border">Titre</th>
            <th className="p-2 border">Prix</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Slug</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="text-center">
              <td className="p-2 border">{p.title}</td>
              <td className="p-2 border">{p.price} €</td>
              <td className="p-2 border">{p.stock}</td>
              <td className="p-2 border">{p.slug}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => router.push(`/fr/admin/produit/${p._id}`)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
