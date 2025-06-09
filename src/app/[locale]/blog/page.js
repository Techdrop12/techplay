// src/app/[locale]/blog/page.js

import Link from 'next/link';
import { notFound } from 'next/navigation';
import SEOHead from '@/components/SEOHead';

/**
 * Page “Blog Listing” (Server Component).
 * 1) Vérifier que la locale existe (import minimal du JSON)
 * 2) Appeler l’API pour récupérer la liste des posts
 * 3) Charger le namespace "blog"
 * 4) Passer à SEOHead + afficher la liste
 */
export default async function BlogListingPage({ params }) {
  // A) Extraire locale directement
  const { locale } = params;

  // B) Vérifier que le JSON de la locale existe
  try {
    await import(`@/messages/${locale}.json`);
  } catch {
    return notFound();
  }

  // C) Récupérer la liste des posts depuis l’API interne
  let posts = [];
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog/all`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erreur lors du chargement du blog');
    posts = await res.json();
  } catch (err) {
    console.error('fetch blog error:', err);
    posts = [];
  }

  // D) Charger le JSON global (fr.json ou en.json)
  let allMessages;
  try {
    allMessages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    allMessages = {};
  }

  // E) Extraire le namespace "blog"
  const namespace = allMessages['blog'] ?? {};
  const t = (key, opts) => {
    const value = namespace[key] ?? key;
    if (!opts) return value;
    return value.replace(/\{(\w+)\}/g, (_, k) => opts[k] ?? `{${k}}`);
  };

  return (
    <>
      <SEOHead titleKey="blog_title" descriptionKey="blog_description" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        {posts.length === 0 ? (
          <p className="text-gray-500">{t('no_posts')}</p>
        ) : (
          <ul className="divide-y border rounded">
            {posts.map((post) => (
              <li key={post._id} className="p-4">
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="text-blue-600 underline text-xl"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-gray-600 mt-1">
                  {t('author', { author: post.author })} &bull;{' '}
                  {new Date(post.createdAt).toLocaleDateString(locale)}
                </p>
                <p className="mt-2 text-gray-700">
                  {post.content.slice(0, 150)}…
                </p>
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  {t('read_more')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
