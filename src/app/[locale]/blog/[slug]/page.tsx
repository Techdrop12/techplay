'use client';

import { sanity } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PortableText } from '@portabletext/react'; // ✅ Permet de lire du contenu riche Sanity

type Params = {
  params: {
    slug: string;
  };
};

export default async function BlogPost({ params }: Params) {
  const post = await sanity.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title,
      mainImage {
        asset-> {
          url
        }
      },
      body
    }`,
    { slug: params.slug }
  );

  if (!post) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{post.title}</h1>

      {post.mainImage?.asset?.url && (
        <Image
          src={post.mainImage.asset.url}
          alt={post.title}
          width={800}
          height={400}
          className="rounded mb-6"
        />
      )}

      <div className="prose prose-lg">
        {/* ✅ Lecture du contenu riche depuis Sanity */}
        <PortableText value={post.body} />
      </div>
    </div>
  );
}
