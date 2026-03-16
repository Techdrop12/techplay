// src/app/blog/page.tsx
import { cookies, headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import type { Metadata } from 'next';

import BlogCard from '@/components/blog/BlogCard';
import Link from '@/components/LocalizedLink';
import { getPosts } from '@/lib/blog';
import { BRAND } from '@/lib/constants';
import { localizePath } from '@/lib/i18n-routing';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  pickBestLocale,
  type Locale,
} from '@/lib/language';
import { generateMeta, jsonLdBreadcrumbs } from '@/lib/seo';

export const revalidate = 60;

const SITE = BRAND.URL;

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  params?: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<SearchParams>;
};

type BlogListOpts = {
  page: number;
  limit: number;
  publishedOnly: boolean;
  tag: string;
  category: string;
  q: string;
  sort: string;
};

type BlogListItem = {
  _id?: string;
  id?: string;
  slug?: string;
  title?: string;
  content?: string;
  description?: string;
  summary?: string;
  excerpt?: string;
  image?: string;
  author?: string;
  published?: boolean;
  publishedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  category?: string;
  tags?: string[];
};

type BlogCardArticle = {
  _id: string;
  id: string;
  slug: string;
  title: string;
  content: string;
  description: string;
  summary: string;
  excerpt: string;
  image: string;
  author: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type GetPostsResult = {
  items: BlogListItem[];
  pagination: Pagination;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getFirstString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) return trimmed;
      }
    }
  }

  return undefined;
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getSearchParam(
  searchParams: SearchParams | undefined,
  key: string,
  fallback = ''
): string {
  if (!searchParams) return fallback;
  return getFirstString(searchParams[key]) ?? fallback;
}

function toIsoString(value: unknown, fallback = new Date().toISOString()): string {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : fallback;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isFinite(d.getTime()) ? d.toISOString() : fallback;
  }

  return fallback;
}

function toBlogOptions(searchParams: SearchParams | undefined): BlogListOpts {
  return {
    page: Math.max(1, getNumber(getSearchParam(searchParams, 'page', '1'), 1)),
    limit: Math.max(1, Math.min(24, getNumber(getSearchParam(searchParams, 'limit', '12'), 12))),
    publishedOnly: true,
    tag: getSearchParam(searchParams, 'tag', ''),
    category: getSearchParam(searchParams, 'category', ''),
    q: getSearchParam(searchParams, 'q', '').trim(),
    sort: getSearchParam(searchParams, 'sort', 'newest'),
  };
}

function normalizeBlogItem(item: unknown, idx: number): BlogCardArticle {
  const record = isRecord(item) ? item : {};

  const slug = getString(record.slug, '');
  const title = getString(record.title, 'Article sans titre');
  const summary = getString(record.summary, '');
  const excerpt = getString(record.excerpt, summary);
  const description = getString(record.description, excerpt || summary);
  const content = getString(record.content, description || summary || title);
  const image = getString(record.image, '/og-image.jpg');
  const author = getString(record.author, 'TechPlay');
  const category = getString(record.category, '');
  const tags = Array.isArray(record.tags)
    ? record.tags.filter((tag): tag is string => typeof tag === 'string')
    : [];

  const rawId =
    getString(record._id, '') ||
    getString(record.id, '') ||
    (slug ? `post-${slug}` : `post-${idx}`);

  const createdAt = toIsoString(record.createdAt ?? record.publishedAt);
  const publishedAt = toIsoString(record.publishedAt ?? record.createdAt, createdAt);
  const updatedAt = toIsoString(record.updatedAt ?? record.createdAt, createdAt);

  return {
    _id: rawId,
    id: rawId,
    slug,
    title,
    content,
    description,
    summary,
    excerpt,
    image,
    author,
    published: record.published === true,
    publishedAt,
    createdAt,
    updatedAt,
    category,
    tags,
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const opts = toBlogOptions(resolved);
  const q = opts.q;
  const page = opts.page;

  const tBlog = await getTranslations('blog');
  const suffix = tBlog('meta_title_suffix');
  const pageStr = tBlog('meta_page', { page: String(page) });

  const baseTitle = tBlog('page_title') + suffix;
  const title = q
    ? `${tBlog('search_results_title', { query: q })} – ${pageStr}${suffix}`
    : page > 1
      ? `${tBlog('title')} – ${pageStr}${suffix}`
      : baseTitle;

  const description = q ? tBlog('search_meta_description', { query: q }) : tBlog('page_subtitle');

  const sp = new URLSearchParams();
  if (q) sp.set('q', q);
  if (page > 1) sp.set('page', String(page));

  const path = `/blog${sp.toString() ? `?${sp.toString()}` : ''}`;

  return generateMeta({
    title,
    description,
    url: path,
    image: '/og-image.jpg',
    noindex: Boolean(q),
  });
}

export default async function BlogPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value ?? '';
  const acceptLang = (await headers()).get('accept-language') || '';
  const pickedLocale = pickBestLocale(acceptLang);

  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : isLocale(pickedLocale)
      ? pickedLocale
      : DEFAULT_LOCALE;

  const t = await getTranslations('common');
  const tBlog = await getTranslations('blog');
  const resolved = searchParams ? await searchParams : undefined;
  const opts = toBlogOptions(resolved);

  const q = opts.q;
  const tagStr = opts.tag;
  const categoryStr = opts.category;
  const sort = opts.sort;
  const page = opts.page;
  const limit = opts.limit;

  const data = (await getPosts(opts)) as GetPostsResult;

  const rawPosts = Array.isArray(data?.items) ? data.items : [];
  const posts: BlogCardArticle[] = rawPosts.map((post, idx) => normalizeBlogItem(post, idx));

  const pagination: Pagination = {
    page: getNumber(data?.pagination?.page, page),
    limit: getNumber(data?.pagination?.limit, limit),
    total: getNumber(data?.pagination?.total, posts.length),
    pages: Math.max(1, getNumber(data?.pagination?.pages, 1)),
  };

  const persist = (
    next: Partial<Record<'page' | 'limit' | 'q' | 'tag' | 'category' | 'sort', string | number>>
  ) => {
    const sp = new URLSearchParams();

    if (q) sp.set('q', q);
    if (tagStr) sp.set('tag', tagStr);
    if (categoryStr) sp.set('category', categoryStr);
    if (sort) sp.set('sort', sort);

    sp.set('limit', String(next.limit ?? limit));
    sp.set('page', String(next.page ?? page));

    return `/blog?${sp.toString()}`;
  };

  const crumbs = jsonLdBreadcrumbs([
    { name: tBlog('breadcrumb_home'), url: localizePath('/', locale) },
    { name: tBlog('title'), url: localizePath('/blog', locale) },
  ]);

  return (
    <main
      className="container-app mx-auto w-full max-w-5xl pt-20 pb-16 sm:pt-24 sm:pb-20"
      aria-labelledby="blog-title"
    >
      <header className="mb-12 text-center sm:mb-14">
        <p className="heading-kicker">{tBlog('section_kicker')}</p>
        <h1
          id="blog-title"
          className="heading-page mt-2"
        >
          {q ? tBlog('search_results_title', { query: q }) : tBlog('page_title')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl heading-section-sub">
          {q ? tBlog('search_results_subtitle') : tBlog('page_subtitle')}
        </p>
      </header>

      <form
        role="search"
        className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
        action={localizePath('/blog', locale)}
        method="GET"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={tBlog('search_placeholder')}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
          aria-label={tBlog('search_aria')}
        />

        <select
          name="sort"
          defaultValue={sort}
          className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
          aria-label={tBlog('sort_aria')}
        >
          <option value="newest">{tBlog('sort_newest')}</option>
          <option value="oldest">{tBlog('sort_oldest')}</option>
          <option value="popular">{tBlog('sort_popular')}</option>
          <option value="az">{tBlog('sort_az')}</option>
          <option value="za">{tBlog('sort_za')}</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[13px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] sm:w-auto"
          >
            {tBlog('filter_btn')}
          </button>

          {(q || tagStr || categoryStr) && (
            <Link
              href="/blog"
              className="text-[13px] font-medium text-token-text/70 transition hover:text-[hsl(var(--accent))]"
            >
              {t('reset_filters')}
            </Link>
          )}
        </div>

        <input type="hidden" name="limit" value={String(limit)} />
        <input type="hidden" name="tag" value={tagStr} />
        <input type="hidden" name="category" value={categoryStr} />
      </form>

      {posts.length === 0 ? (
        <div
          className="mx-auto max-w-xl overflow-hidden rounded-[var(--radius-2xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding text-center shadow-sm"
          role="status"
          aria-live="polite"
        >
          {q ? (
            <>
              <div className="flex justify-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--surface-2))] text-token-text/50"
                  aria-hidden="true"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
              </div>
              <h2 className="mt-6 heading-subsection">{tBlog('no_articles_search')}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-token-text/70">
                {tBlog('no_results_for_query', { query: q })}
              </p>
              <Link
                href={localizePath('/blog', locale)}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              >
                {tBlog('view_all_articles')}
              </Link>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]"
                  aria-hidden="true"
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <path d="M8 7h8" />
                    <path d="M8 11h8" />
                  </svg>
                </span>
              </div>
              <h2 className="mt-6 heading-subsection">{tBlog('editorial_coming_soon')}</h2>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-token-text/70">
                {tBlog('editorial_coming_intro')}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={localizePath('/products', locale)}
                  className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:bg-[hsl(var(--accent)/0.9)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                >
                  {tBlog('explore_products')}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href={localizePath('/', locale)}
                  className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 py-2.5 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                >
                  {tBlog('back_to_home')}
                </Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <section
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3"
          aria-label={tBlog('articles_list_aria')}
        >
          {posts.map((post, idx) => (
            <BlogCard key={post._id || post.slug || `post-${idx}`} article={post} />
          ))}
        </section>
      )}

      {pagination.pages > 1 && (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
          aria-label={tBlog('pagination_articles_aria')}
        >
          <Link
            href={persist({ page: Math.max(1, page - 1) })}
            aria-disabled={page <= 1}
            className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
              page <= 1
                ? 'pointer-events-none border-[hsl(var(--border))] opacity-40'
                : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]/80'
            }`}
          >
            ← {tBlog('pagination_prev')}
          </Link>

          {Array.from({ length: pagination.pages }).map((_, i) => {
            const n = i + 1;

            if (n === 1 || n === pagination.pages || Math.abs(n - page) <= 1) {
              return (
                <Link
                  key={n}
                  href={persist({ page: n })}
                  aria-current={n === page ? 'page' : undefined}
                  className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
                    n === page
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)]'
                      : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]/80'
                  }`}
                >
                  {n}
                </Link>
              );
            }

            if (n === 2 && page > 3) {
              return (
                <span key="dots-left" className="px-2 text-token-text/40">
                  …
                </span>
              );
            }

            if (n === pagination.pages - 1 && page < pagination.pages - 2) {
              return (
                <span key="dots-right" className="px-2 text-token-text/40">
                  …
                </span>
              );
            }

            return null;
          })}

          <Link
            href={persist({ page: Math.min(pagination.pages, page + 1) })}
            aria-disabled={page >= pagination.pages}
            className={`rounded-xl border px-3.5 py-2 text-[13px] font-medium transition ${
              page >= pagination.pages
                ? 'pointer-events-none border-[hsl(var(--border))] opacity-40'
                : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))]/80'
            }`}
          >
            {tBlog('pagination_next')} →
          </Link>
        </nav>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />

      {posts.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              itemListElement: posts.map((post, idx) => ({
                '@type': 'ListItem',
                position: idx + 1 + (page - 1) * limit,
                url: `${SITE}${localizePath(`/blog/${post.slug}`, locale)}`,
                name: post.title,
              })),
            }),
          }}
        />
      )}
    </main>
  );
}
