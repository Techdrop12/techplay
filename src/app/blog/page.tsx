import { getLatestBlogPosts } from '@/lib/data'
import Link from 'next/link'
import type { BlogPost } from '@/types/blog'

export default async function BlogPage() {
  const rawPosts = await getLatestBlogPosts()

  const posts: BlogPost[] = Array.isArray(rawPosts)
    ? rawPosts.map((post) => ({
        _id: String(post._id),
        slug: post.slug,
        title: post.title,
        description: post.description,
        content: post.content,
        createdAt: post.createdAt?.toString(), // ✅ conversion
      }))
    : []

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-brand text-center">
        Nos articles de blog
      </h1>
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Aucun article disponible pour le moment.
        </p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-xl font-semibold hover:underline text-blue-700 dark:text-blue-400"
              >
                {post.title}
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {post.description?.slice(0, 120)}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
