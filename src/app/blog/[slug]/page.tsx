import { getBlogBySlug } from '@/lib/data'

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = await getBlogBySlug(params.slug)

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 prose dark:prose-invert">
      <h1>{article.title}</h1>
      <p className="text-sm text-gray-500 mb-4">{article.description}</p>
      <article dangerouslySetInnerHTML={{ __html: article.content }} />
    </main>
  )
}
