import { getPackBySlug } from '@/lib/data'
import PackDetails from '@/components/product/PackDetails'

export default async function PackPage({ params }: { params: { slug: string } }) {
  const pack = await getPackBySlug(params.slug)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <PackDetails pack={pack} />
    </main>
  )
}
