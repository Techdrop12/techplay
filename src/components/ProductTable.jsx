'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/admin/products');
        if (!res.ok) throw new Error('Erreur API');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        toast.error('Erreur chargement produits');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce produit ?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Suppression échouée');
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Produit supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 dark:text-gray-300">Chargement...</p>;
  }

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-2xl font-bold mb-4">📦 Produits en base</h2>
      <table className="min-w-full text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="p-2 border">Titre</th>
            <th className="p-2 border">Prix</th>
            <th className="p-2 border">Stock</th>
            <th className="p-2 border">Slug</th>
            <th className="p-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                Aucun produit trouvé.
              </td>
            </tr>
          ) : (
            products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-t">
                <td className="p-2 border">{p.title}</td>
                <td className="p-2 border">{p.price.toFixed(2)} €</td>
                <td className="p-2 border">{p.stock}</td>
                <td className="p-2 border">{p.slug}</td>
                <td className="p-2 border flex justify-center gap-2">
                  <button
                    onClick={() => router.push(`/fr/admin/produit/${p._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
