'use client';

import type { BlogPost } from '@/types/blog';

import { useTranslations } from 'next-intl';
import { BRAND } from '@/lib/constants';
import { localizePath, type Locale } from '@/lib/i18n-routing';

type BlogJsonLdPost = BlogPost & {
  createdAt?: string | number | Date;
  updatedAt?: string | number | Date;
  author?: string;
};

interface BlogJsonLdProps {
  posts: BlogJsonLdPost[];
  locale?: Locale;
  siteUrl?: string;
}

function iso(d?: string | number | Date): string | undefined {
  if (!d) return undefined;
  const x = d instanceof Date ? d : new Date(d);
  return Number.isFinite(x.getTime()) ? x.toISOString() : undefined;
}

export default function BlogJsonLd({
  posts = [],
  locale = 'fr',
  siteUrl = BRAND.URL,
}: BlogJsonLdProps) {
  const t = useTranslations('blog');
  if (!Array.isArray(posts) || posts.length === 0) return null;

  const blogPath = localizePath('/blog', locale);
  const blogUrl = `${siteUrl}${blogPath}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': blogUrl,
    url: blogUrl,
    name: t('jsonld_name'),
    description: t('jsonld_description'),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    blogPost: posts.map((post) => {
      const postUrl = `${siteUrl}${localizePath(`/blog/${post.slug}`, locale)}`;
      const datePublished = iso(post.createdAt);
      const dateModified = iso(post.updatedAt);

      return {
        '@type': 'BlogPosting',
        headline: post.title,
        url: postUrl,
        ...(datePublished ? { datePublished } : {}),
        ...(dateModified ? { dateModified } : {}),
        author: {
          '@type': 'Person',
          name: post.author || 'TechPlay',
        },
      };
    }),
    publisher: {
      '@type': 'Organization',
      name: 'TechPlay',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
