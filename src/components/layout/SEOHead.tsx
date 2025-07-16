import Head from 'next/head'

export default function SEOHead({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Head>
      <title>{title} | TechPlay</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
  )
}
