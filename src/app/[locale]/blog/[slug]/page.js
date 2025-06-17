// ✅ src/app/[locale]/blog/[slug]/page.js

import { notFound } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import ArticleJsonLd from '@/components/JsonLd/ArticleJsonLd';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export default async function BlogPostPage({ params: { locale, slug } }) {
  try {
    await import(`@/messages/${locale}.json`);
  } catch {
    return notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/blog/one?slug=${slug}`, { cache: 'no-store' });
  if (!res.ok) return notFound();

  const data = await res.json();
  if (!data) return notFound();

  const content = locale === 'en' && data.en ? data.en : data.content;
  const post = { ...data, content };

  const pageTitle = post.title;
  const pageDescription = typeof post.content === 'string' ? post.content.slice(0, 150) : '';

  return (
    <>
      <SEOHead overrideTitle={pageTitle} overrideDescription={pageDescription} image={post.image} />
      <ArticleJsonLd post={post} />
      <article className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="rounded mb-4"
          />
        )}
        <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </>
  );
}
