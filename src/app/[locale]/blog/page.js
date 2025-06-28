// ✅ /src/app/[locale]/blog/page.js (listing blog, SEO, IA, optimisé)
import BlogCard from '@/components/BlogCard';
import SEOHead from '@/components/SEOHead';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  // Récupération côté server
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog/all`, {
    cache: 'no-store',
  });
  const articles = await res.json();

  return (
    <>
      <SEOHead
        overrideTitle="Blog TechPlay – Guides & Astuces"
        overrideDescription="Retrouvez nos articles sur les dernières tendances tech, guides et avis produits rédigés par IA."
      />
      <main className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Blog TechPlay</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {articles.length === 0
            ? <p className="text-gray-600">Aucun article pour l’instant.</p>
            : articles.map((a) => <BlogCard key={a._id} article={a} />)
          }
        </div>
      </main>
    </>
  );
}
