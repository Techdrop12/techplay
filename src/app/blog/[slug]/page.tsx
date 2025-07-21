import { getBlogPostBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import type { BlogPost } from '@/types/blog'
import { notFound } from 'next/navigation'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post || typeof post !== 'object' || Array.isArray(post)) {
    return { title: 'Article introuvable – TechPlay' }
  }

  return {
    title: `${post.title} – TechPlay`,
    description: post.description || 'Article de blog TechPlay',
    alternates: {
      canonical: `/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description || '',
      type: 'article',
      url: `https://www.techplay.fr/blog/${params.slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post || typeof post !== 'object' || Array.isArray(post)) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-brand">{post.title}</h1>
      <article
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </main>
  )
}
