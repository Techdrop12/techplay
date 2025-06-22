// ✅ OGMetaTags.js – utilisé si besoin pour injecter des balises OG supplémentaires
import Head from 'next/head'

export default function OGMetaTags({ title, description, image, url }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://techplay.fr'
  const finalUrl = url || siteUrl
  const finalImage = image || `${siteUrl}/logo.png`

  return (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content="website" />
    </Head>
  )
}
