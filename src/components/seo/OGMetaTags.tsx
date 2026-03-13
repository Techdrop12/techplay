// src/components/seo/OGMetaTags.tsx
'use client';

/**
 * @deprecated Utilisez de préférence la Metadata API (export const metadata).
 * Ce composant reste pour compatibilité et délègue à <SEOHead/>.
 */
import type { ReactNode } from 'react';

import SEOHead from '@/components/SEOHead';
import { defaultMeta } from '@/lib/meta';

interface OGMetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  children?: ReactNode;
}

export default function OGMetaTags({ title, description, image, url }: OGMetaTagsProps) {
  return (
    <SEOHead
      title={title || defaultMeta.title}
      description={description || defaultMeta.description}
      image={image || defaultMeta.image}
      url={url}
      type="website"
    />
  );
}
