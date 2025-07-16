import BlogList from '@/components/blog/BlogList'
import { getBlogArticles } from '@/lib/data'

export default async function BlogPage() {
  const articles = await getBlogArticles()

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Nos articles</h1>
      <BlogList articles={articles} />
    </main>
  )
}
