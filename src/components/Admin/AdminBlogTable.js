'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function AdminBlogTable() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/blog/all')
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => toast.error('Erreur chargement articles'));
  }, []);

  const togglePublish = async (id) => {
    const res = await fetch('/api/blog/toggle-publish', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, published: !p.published } : p))
      );
    }
  };

  const deletePost = async (id) => {
    const res = await fetch('/api/blog/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Article supprimé');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Articles du blog</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Titre</th>
            <th className="p-2">Publié</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id} className="border-b">
              <td className="p-2">{post.title}</td>
              <td className="p-2">{post.published ? '✅ Oui' : '❌ Non'}</td>
              <td className="p-2 flex gap-2">
                <button onClick={() => togglePublish(post._id)} className="text-blue-600 underline">
                  {post.published ? 'Dépublier' : 'Publier'}
                </button>
                <button onClick={() => deletePost(post._id)} className="text-red-600 underline">
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
