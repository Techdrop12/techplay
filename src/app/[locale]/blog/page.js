// ✅ src/app/[locale]/blog/page.js

import BlogCard from '@/components/BlogCard';
import SEOHead from '@/components/SEOHead';
import dbConnect from '@/lib/dbConnect';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

export default async function BlogListPage({ params }) {
  const { locale } = params;
  await dbConnect();
  const articles = await Blog.find({ published: true })
    .sort({ publishedAt: -1 })
    .limit(50)
    .lean();

  return (
    <>
      <SEOHead
        overrideTitle={locale === 'fr' ? 'Blog TechPlay' : 'TechPlay Blog'}
        overrideDescription={
          locale === 'fr'
            ? 'Les meilleurs articles tech générés par IA.'
            : 'Best AI-generated tech articles.'
        }
      />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          {locale === 'fr' ? 'Blog TechPlay' : 'TechPlay Blog'}
        </h1>
        {articles.length === 0 ? (
          <p className="text-gray-600">
            {locale === 'fr'
              ? 'Aucun article disponible pour le moment.'
              : 'No articles available yet.'}
          </p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <BlogCard key={article._id} article={article} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
