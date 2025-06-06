// src/app/[locale]/blog/page.js
'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import SEOHead from '@/components/SEOHead';
import BlogCard from '@/components/BlogCard';
import BlogListJsonLd from '@/components/BlogListJsonLd';

/**
 * Composant client “Blog” :
 * – Chargement des posts depuis /api/blog/all
 * – Affichage via BlogCard
 * – SEOHead + JSON-LD via BlogListJsonLd
 */
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const locale = useLocale();
  const tSeo = useTranslations('seo');   // pour la partie meta
  const tBlog = useTranslations('blog'); // pour traductions spécifiques (blog)

  useEffect(() => {
    fetch('/api/blog/all')
      .then((res) => res.json())
      .then(setPosts)
      .catch(console.error);
  }, []);

  // Titre & description SEO
  const blogTitle = tSeo('blog_title');
  const blogDescription = tSeo('blog_description');

  // Breadcrumb JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || '';
  const basePath = `${siteUrl}/${locale}`;
  const breadcrumbSegments = [
    { label: tSeo('homepage_title'), url: `${basePath}` },
    { label: blogTitle,             url: `${basePath}/blog` },
  ];

  return (
    <div>
      <SEOHead
        overrideTitle={blogTitle}
        overrideDescription={blogDescription}
        breadcrumbSegments={breadcrumbSegments}
      />

      <div className="p-6 max-w-4xl mx-auto">
        <BlogListJsonLd posts={posts} />

        <h1 className="text-2xl font-bold mb-6">{blogTitle}</h1>

        {posts.length === 0 ? (
          <p className="text-gray-500">{tBlog('no_posts')}</p>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => {
              const content = locale === 'en' && post.en ? post.en : post.content;
              return <BlogCard key={post._id} post={{ ...post, content }} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
