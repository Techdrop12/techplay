// ✅ /src/app/[locale]/blog/[slug]/page.js (détail article, SEO, JsonLD)
import SEOHead from '@/components/SEOHead';
import BlogJsonLd from '@/components/BlogJsonLd';

export const dynamic = 'force-dynamic';

export default async function BlogDetailPage({ params }) {
  const { slug } = params;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog/one?slug=${slug}`, { cache: 'no-store' });
  if (!res.ok) return <div className="p-8">Article introuvable.</div>;
  const article = await res.json();

  return (
    <>
      <SEOHead
        overrideTitle={article.title}
        overrideDescription={article.description || article.content?.slice(0, 160)}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${slug}`}
      />
      <BlogJsonLd article={article} />
      <main className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
        <p className="mt-8 text-sm text-gray-500">
          Publié le {new Date(article.createdAt).toLocaleDateString('fr')}
        </p>
      </main>
    </>
  );
}
