import { getLatestBlogPosts } from '@/lib/data'
import BlogCard from '@/components/blog/BlogCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog TechPlay – Conseils et nouveautés',
  description: "Explorez nos articles, guides et conseils sur les produits TechPlay.",
}

export default async function BlogPage() {
  const posts = await getLatestBlogPosts()

  return (
    <main
      className="max-w-6xl mx-auto px-4 pt-32 pb-20"
      aria-labelledby="blog-title"
    >
      <h1
        id="blog-title"
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand dark:text-brand-light text-center mb-10"
      >
        Nos articles de blog
      </h1>

      {posts.length === 0 ? (
        <p
          className="text-center text-gray-500 dark:text-gray-400 text-lg"
          role="alert"
          aria-live="polite"
        >
          Aucun article disponible pour le moment.
        </p>
      ) : (
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          aria-label="Liste des articles"
        >
          {posts.map((post) => (
            <BlogCard key={post._id} article={post} />
          ))}
        </section>
      )}
    </main>
  )
}
