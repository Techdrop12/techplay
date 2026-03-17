import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import type { Metadata } from 'next';

import Link from '@/components/LocalizedLink';
import { getPostBySlug } from '@/lib/blog';
import { BRAND } from '@/lib/constants';
import { localizePath } from '@/lib/i18n-routing';
import { LOCALE_COOKIE, isLocale, pickBestLocale, type Locale } from '@/lib/language';
import { generateMeta, jsonLdBreadcrumbs } from '@/lib/seo';
import { safeProductImageUrl } from '@/lib/safeProductImage';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

const SITE = BRAND.URL;
const WPM = 200;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getString(value: unknown, fallback: string): string {
  if (value == null) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function toIso(date: unknown): string | undefined {
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string' && date) return date;
  return undefined;
}

function readingTimeMinutes(text: string): number {
  const stripped = text.replace(/<[^>]+>/g, ' ').trim();
  const words = stripped ? stripped.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / WPM));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post || typeof post !== 'object') {
    return { title: 'Article introuvable' };
  }
  const record = post as Record<string, unknown>;
  const title = getString(record.title, 'Article');
  const description = getString(record.description, '');
  return generateMeta({
    title: `${title} – Blog TechPlay`,
    description: description || 'Article du blog TechPlay.',
    url: `/blog/${slug}`,
    image: record.image ? safeProductImageUrl(String(record.image)) : '/og-image.jpg',
  });
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const acceptLang = (await headers()).get('accept-language') || '';
  const locale: Locale =
    cookieLocale && isLocale(cookieLocale) ? cookieLocale : pickBestLocale(acceptLang);

  const post = await getPostBySlug(slug);

  if (!post || typeof post !== 'object') {
    notFound();
  }

  const record = post as Record<string, unknown>;
  const title = getString(record.title, 'Article');
  const description = getString(record.description, '');
  const image = record.image ? safeProductImageUrl(String(record.image)) : '/og-image.jpg';
  const author = getString(record.author, 'TechPlay');
  const publishedAt = toIso(record.publishedAt ?? record.createdAt);
  const updatedAt = toIso(record.updatedAt);
  const dateLocale = locale === 'en' ? 'en-US' : 'fr-FR';
  const minRead = readingTimeMinutes(description);
  const showUpdated =
    updatedAt &&
    publishedAt &&
    updatedAt !== publishedAt &&
    new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > 60_000;

  const tBlog = await getTranslations('blog');
  const crumbs = jsonLdBreadcrumbs([
    { name: tBlog('breadcrumb_home'), url: localizePath('/', locale) },
    { name: tBlog('title'), url: localizePath('/blog', locale) },
    { name: title, url: `${SITE}${localizePath(`/blog/${slug}`, locale)}` },
  ]);

  return (
    <main
      className="container-app mx-auto w-full max-w-3xl pt-28 pb-16 sm:pt-32 sm:pb-20"
      aria-labelledby="article-title"
    >
      <nav className="mb-8" aria-label={tBlog('breadcrumb_aria')}>
        <Link
          href={localizePath('/blog', locale)}
          className="inline-flex items-center gap-1.5 text-[13px] text-token-text/70 transition hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
        >
          <span aria-hidden>←</span>
          {tBlog('back_to_blog')}
        </Link>
      </nav>

      <article className="space-y-6">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-medium uppercase tracking-[0.12em] text-token-text/55">
            {publishedAt ? (
              <time dateTime={publishedAt}>{formatDate(publishedAt, dateLocale)}</time>
            ) : null}
            {publishedAt || minRead > 0 ? (
              <span>{tBlog('min_read', { min: minRead })}</span>
            ) : null}
            {showUpdated && updatedAt ? (
              <span>{tBlog('updated_on', { date: formatDate(updatedAt, dateLocale) })}</span>
            ) : null}
          </div>
          <h1 id="article-title" className="heading-page">
            {title}
          </h1>
          {author ? (
            <p className="text-[14px] text-token-text/70">{tBlog('author', { author })}</p>
          ) : null}
        </header>

        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            width={800}
            height={500}
          />
        </div>

        {description ? (
          <div
            className="blog-article-body prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed text-[hsl(var(--text))]/90 prose-p:mb-4 prose-headings:font-semibold"
            dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
          />
        ) : null}
      </article>

      <div className="mt-10 border-t border-[hsl(var(--border))] pt-8">
        <Link
          href={localizePath('/blog', locale)}
          className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold text-token-text/80 transition hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
        >
          <span aria-hidden>←</span>
          {tBlog('back_to_blog')}
        </Link>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: description || undefined,
            image: image,
            author: { '@type': 'Person', name: author },
            datePublished: publishedAt || undefined,
            dateModified: updatedAt || publishedAt || undefined,
            url: `${SITE}${localizePath(`/blog/${slug}`, locale)}`,
            publisher: {
              '@type': 'Organization',
              name: BRAND.NAME,
              url: SITE,
              logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE}${localizePath(`/blog/${slug}`, locale)}`,
            },
          }),
        }}
      />
    </main>
  );
}
