'use client';

import { sanity } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PortableText } from '@portabletext/react'; // Permet de lire du contenu riche Sanity

export default async function BlogPost({ params }) {
    const { slug } = params;
    const post = await sanity.fetch(`*[_type == "post" && slug.current == $slug][0]{
        title,
        mainImage {
            asset->{
                url
            }
        },
        ...
    }`, { slug });

    if (!post) {
        notFound();
    }

    return (
        <article>
            <h1>{post.title}</h1>
            {post.mainImage?.asset?.url && (
                <Image
                    src={post.mainImage.asset.url}
                    alt={post.title}
                    width={800}
                    height={600}
                />
            )}
            {post.content && (
                <PortableText value={post.content} />
            )}
        </article>
    );
}
