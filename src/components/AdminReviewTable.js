'use client';

import { useEffect, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminReviewTable() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      toast.error("Erreur lors du chargement des avis");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('❌ Supprimer cet avis ?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('✅ Avis supprimé');
        setReviews((prev) => prev.filter((r) => r._id !== id));
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Échec de la suppression");
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">📝 Gestion des avis clients</h2>

      {loading ? (
        <p className="text-gray-500">Chargement des avis...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400">Aucun avis pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th className="text-left px-4 py-2">Nom</th>
                <th className="text-left px-4 py-2">Note</th>
                <th className="text-left px-4 py-2">Commentaire</th>
                <th className="text-left px-4 py-2">Produit</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-center px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <motion.tr
                  key={r._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                >
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i <= r.rating ? 'text-yellow-400' : 'text-gray-300'}
                          fill={i <= r.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2 max-w-xs break-words">{r.comment}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{r.productId}</td>
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Supprimer l’avis"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
