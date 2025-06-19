import Link from 'next/link';
import { notFound } from 'next/navigation';
import SEOHead from '@/components/SEOHead';

export const dynamic = 'force-dynamic';

export default async function BlogListingPage({ params }) {
  const { locale } = params;

  try {
    await import(`@/messages/${locale}.json`);
  } catch {
    return notFound();
  }

  let posts = [];
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/blog/all`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Erreur API blog');
    posts = await res.json();
  } catch (err) {
    console.error('fetch blog error:', err);
  }

  let allMessages;
  try {
    allMessages = (await import(`@/messages/${locale}.json`)).default;
  } catch {
    allMessages = {};
  }

  const namespace = allMessages['blog'] ?? {};
  const t = (key, opts) => {
    const value = namespace[key] ?? key;
    if (!opts) return value;
    return value.replace(/\{(\w+)\}/g, (_, k) => opts[k] ?? `{${k}}`);
  };

  const dateFormatter = new Intl.DateTimeFormat(
    locale === 'fr' ? 'fr-FR' : 'en-US',
    { dateStyle: 'medium' }
  );

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
                  {dateFormatter.format(new Date(post.createdAt))}
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
