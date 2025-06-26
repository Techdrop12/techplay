// ✅ src/components/AdminBlogTable.js

'use client';

import { useEffect, useState } from 'react';

export default function AdminBlogTable() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/blog/all')
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  const publish = async (id) => {
    await fetch(`/api/blog/toggle-publish?id=${id}`, { method: 'POST' });
    setPosts(posts.map((p) => p._id === id ? { ...p, published: !p.published } : p));
  };

  const del = async (id) => {
    await fetch(`/api/blog/delete?id=${id}`, { method: 'DELETE' });
    setPosts(posts.filter((p) => p._id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Articles du Blog</h2>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id} className="border-b">
              <td>{post.title}</td>
              <td>{post.published ? 'Publié' : 'Brouillon'}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="mr-2 text-blue-600" onClick={() => publish(post._id)}>
                  {post.published ? 'Dépublier' : 'Publier'}
                </button>
                <button className="text-red-600" onClick={() => del(post._id)}>
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
