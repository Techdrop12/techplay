import { getBlogPostBySlug } from '@/lib/data'
import type { Metadata } from 'next'
import type { BlogPost } from '@/types/blog'
import { notFound } from 'next/navigation'
import ArticleJsonLd from '@/components/JsonLd/ArticleJsonLd'

interface Props {
  params: { slug: string }
  locale: string
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post || typeof post !== 'object' || Array.isArray(post)) {
    return {
      title: 'Article introuvable – TechPlay',
      description: 'Cet article n’existe pas ou a été supprimé.',
    }
  }

  return {
    title: `${post.title} – TechPlay`,
    description: post.description || 'Article de blog TechPlay',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${params.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description || '',
      type: 'article',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${params.slug}`,
      images: post.image
        ? [{ url: post.image, alt: post.title }]
        : [{ url: '/placeholder.png', alt: 'Image article TechPlay' }],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post || typeof post !== 'object' || Array.isArray(post)) {
    notFound()
  }

  const safePost = post as BlogPost

  return (
    <>
      <main className="max-w-3xl mx-auto py-10 px-4" aria-label={`Article : ${safePost.title}`}>
        <h1 className="text-3xl font-bold mb-4 text-brand">{safePost.title}</h1>
        <article
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: safePost.content || '' }}
        />
      </main>

      <ArticleJsonLd post={safePost} />
    </>
  )
}
