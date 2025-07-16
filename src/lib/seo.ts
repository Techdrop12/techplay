interface MetaProps {
  title: string
  description: string
  url: string
  image?: string
  type?: string
}

export function generateMeta({
  title,
  description,
  url,
  image = '/og-image.jpg',
  type = 'website',
}: MetaProps) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type,
      locale: 'fr_FR',
      url,
      site_name: 'TechPlay',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
