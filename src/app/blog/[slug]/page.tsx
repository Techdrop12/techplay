// src/app/blog/[slug]/page.tsx
import { getBlogPostBySlug } from '@/lib/data'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ArticleJsonLd from '@/components/JsonLd/ArticleJsonLd'
import type { BlogPost } from '@/types/blog'
import { generateArticleMeta, jsonLdBreadcrumbs } from '@/lib/seo'
import { cookies, headers } from 'next/headers'
import { LOCALE_COOKIE, isLocale, pickBestLocale, type Locale } from '@/lib/language'
import { localizePath } from '@/lib/i18n-routing'

interface Props {
  params: { slug: string }
}

/* ---------------------- Metadata ---------------------- */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)
  const path = `/blog/${params.slug}`

  if (!post) {
    return generateArticleMeta(
      {
        title: 'Article introuvable',
        description: 'Cet article n’existe pas ou a été supprimé.',
        url: path,
        image: '/placeholder.png',
        noindex: true,
      },
      {}
    )
  }

  const p = post as Record<string, any>

  const image = (p.image as string) ?? '/placeholder.png'
  const published = (p.publishedAt ?? p.date ?? p.createdAt) as string | undefined
  const updated = (p.updatedAt ?? p.modifiedAt ?? published) as string | undefined
  const authors: string[] | undefined = Array.isArray(p.authors)
    ? (p.authors as string[])
    : p.author
    ? [String(p.author)]
    : undefined
  const section = (p.category ?? p.section) as string | undefined
  const tags = Array.isArray(p.tags) ? (p.tags as string[]) : undefined

  return generateArticleMeta(
    {
      title: String(p.title ?? 'Article'),
      description: String(p.description ?? 'Article du blog TechPlay.'),
      url: path,
      image,
    },
    {
      publishedTime: published,
      modifiedTime: updated,
      authors,
      section,
      tags,
    }
  )
}

/* ------------------------------ Page ----------------------------- */
export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const safePost = post as BlogPost

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const acceptLang = (await headers()).get('accept-language') || ''
  const locale: Locale = isLocale(cookieLocale || '') ? (cookieLocale as Locale) : pickBestLocale(acceptLang)

  const crumbs = jsonLdBreadcrumbs([
    { name: 'Accueil', url: localizePath('/', locale) },
    { name: 'Blog', url: localizePath('/blog', locale) },
    { name: safePost.title, url: localizePath(`/blog/${params.slug}`, locale) },
  ])

  return (
    <>
      <main className="max-w-3xl mx-auto py-10 px-4" aria-label={`Article : ${safePost.title}`}>
        <h1 className="text-3xl font-bold mb-4 text-brand">{safePost.title}</h1>
        <article
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: (safePost as any).content || '' }}
        />
      </main>

      {/* JSON-LD Article */}
      <ArticleJsonLd post={safePost} />

      {/* JSON-LD Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
    </>
  )
}
