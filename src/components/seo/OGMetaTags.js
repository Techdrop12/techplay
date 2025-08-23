'use client'

import SEOHead from '@/components/SEOHead'
import { defaultMeta } from '@/lib/meta'

export default function OGMetaTags({ title, description, image, url }) {
  return (
    <SEOHead
      title={title || defaultMeta.title}
      description={description || defaultMeta.description}
      image={image || defaultMeta.image}
      url={url}
      type="website"
    />
  )
}
