'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminBlogTable() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/blog/all')
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  const togglePublish = async (id) => {
    const res = await fetch(`/api/blog/toggle-publish?id=${id}`, { method: 'POST' })
    if (res.ok) {
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, published: !p.published } : p))
      )
    }
  }

  const deletePost = async (id) => {
    if (!confirm('Confirmer la suppression ?')) return
    const res = await fetch(`/api/blog/delete?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p._id !== id))
    }
  }

  if (loading) return <p className="p-4 text-gray-500">Chargement des articles...</p>

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📝 Articles du Blog</h2>
      <table className="min-w-full table-auto text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">Titre</th>
            <th className="px-4 py-2">Publié</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id} className="border-t">
              <td className="px-4 py-2">{post.title}</td>
              <td className="px-4 py-2">{post.published ? '✅ Oui' : '❌ Non'}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => togglePublish(post._id)}
                  className="text-blue-600 underline"
                >
                  {post.published ? 'Dépublier' : 'Publier'}
                </button>
                <Link href={`/admin/edit-blog/${post.slug}`} className="text-yellow-600 underline">
                  Modifier
                </Link>
                <button
                  onClick={() => deletePost(post._id)}
                  className="text-red-600 underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
