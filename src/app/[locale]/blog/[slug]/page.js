// ✅ src/app/[locale]/blog/[slug]/page.js

import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';
import SEOHead from '@/components/SEOHead';

export const dynamic = 'force-dynamic';

export default async function BlogArticlePage({ params }) {
  const { slug, locale } = params;
  await dbConnect();
  const article = await Blog.findOne({ slug, published: true }).lean();

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-red-500">
        {locale === 'fr' ? "Article introuvable." : "Article not found."}
      </div>
    );
  }

  return (
    <>
      <SEOHead
        overrideTitle={article.title}
        overrideDescription={article.summary}
        url={`/${locale}/blog/${article.slug}`}
      />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
        <div className="text-gray-500 text-sm mb-4">
          {new Date(article.publishedAt).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>
    </>
  );
}
