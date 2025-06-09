// File: src/app/[locale]/blog/[slug]/page.js
import { notFound } from 'next/navigation';
import SEOHead from '@/components/SEOHead';
import ArticleJsonLd from '@/components/JsonLd/ArticleJsonLd';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

// Si vous ne voulez pas de pré-génération à la build, laissez generateStaticParams vide
export async function generateStaticParams() {
  return [];
}

export default async function BlogPostPage({ params: { locale, slug } }) {
  // 1) Charger les traductions de la locale (pour, au besoin, fallback de description, etc.)
  try {
    // On n'utilise pas createTranslator ici, juste on s'assure que le fichier existe
    await import(`@/messages/${locale}.json`);
  } catch {
    return notFound();
  }

  // 2) Appeler l’API interne pour récupérer le post par son slug
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/blog/one?slug=${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return notFound();
  }

  const data = await res.json();
  if (!data) {
    return notFound();
  }

  // 3) Choisir la version du contenu en fonction de la locale
  const content =
    locale === 'en' && data.en
      ? data.en
      : data.content;

  const post = { ...data, content };

  // 4) Construire titre et description pour <SEOHead>
  const pageTitle = post.title;
  const pageDescription =
    (typeof post.content === 'string' ? post.content.slice(0, 150) : '') ||
    '';

  return (
    <>
      <SEOHead
        overrideTitle={pageTitle}
        overrideDescription={pageDescription}
        image={post.image}
      />

      <ArticleJsonLd post={post} />

      <article className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={400}
            className="rounded mb-4"
          />
        )}
        <div
          className="prose prose-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}
