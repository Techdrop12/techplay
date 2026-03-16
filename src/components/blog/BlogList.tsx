'use client';

import { useTranslations } from 'next-intl';

import BlogCard from './BlogCard';

import type { BlogPost } from '@/types/blog';

interface BlogListProps {
  articles: BlogPost[];
}

export default function BlogList({ articles }: BlogListProps) {
  const t = useTranslations('blog');
  if (!articles?.length) return null;

  return (
    <section
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-label={t('articles_list_aria')}
    >
      {articles.map((article) => (
        <BlogCard key={article._id ?? article.slug} article={article} />
      ))}
    </section>
  );
}
