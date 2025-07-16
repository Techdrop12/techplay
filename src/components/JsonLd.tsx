import Head from 'next/head'

export default function JsonLd({ json }: { json: Record<string, any> }) {
  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
    </Head>
  )
}
