'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/LocalizedLink'
import { toast } from 'react-hot-toast';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: string | Date;
}

export default function AdminBlogTable() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog/all')
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => {
        toast.error('Erreur lors du chargement des articles');
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (id: string) => {
    const res = await fetch(`/api/blog/toggle-publish?id=${id}`, {
      method: 'POST',
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, published: !p.published } : p
        )
      );
      toast.success('Statut mis à jour');
    } else {
      toast.error('Erreur de publication');
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Confirmer la suppression ?')) return;
    const res = await fetch(`/api/blog/delete?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Article supprimé');
    } else {
      toast.error('Erreur de suppression');
    }
  };

  if (loading) {
    return (
      <p className="text-gray-500 animate-pulse p-4">
        Chargement des articles…
      </p>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📝 Articles du Blog</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-zinc-800 text-left">
              <th className="px-4 py-2">Titre</th>
              <th className="px-4 py-2 text-center">Statut</th>
              <th className="px-4 py-2 text-center">Date</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post._id}
                className="border-t hover:bg-gray-50 dark:hover:bg-zinc-700"
              >
                <td className="px-4 py-2">{post.title}</td>
                <td className="px-4 py-2 text-center">
                  {post.published ? '✅ Publié' : '❌ Brouillon'}
                </td>
                <td className="px-4 py-2 text-center">
                  {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-2 space-x-2 text-center">
                  <button
                    onClick={() => togglePublish(post._id)}
                    className="text-blue-600 hover:underline"
                  >
                    {post.published ? 'Dépublier' : 'Publier'}
                  </button>
                  <Link
                    href={`/admin/edit-blog/${post.slug}`}
                    className="text-yellow-600 hover:underline"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => deletePost(post._id)}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-gray-400"
                >
                  Aucun article pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
