'use client'

import Head from 'next/head'

interface Props {
  title?: string
  description?: string
  image?: string
  url?: string
}

export default function SEOHead({
  title = 'TechPlay – Boutique high-tech',
  description = 'Découvrez les meilleurs gadgets et accessoires technologiques.',
  image = '/og-image.jpg',
  url = 'https://www.techplay.fr',
}: Props) {
  const fullTitle = title.includes('TechPlay') ? title : `${title} | TechPlay`

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@techplay" />
    </Head>
  )
}
