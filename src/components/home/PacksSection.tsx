import PackCard from '@/components/product/PackCard'
import { getRecommendedPacks } from '@/lib/data'

export default async function PacksSection() {
  const packs = await getRecommendedPacks()

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Packs recommandés</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <PackCard key={pack._id} pack={pack} />
        ))}
      </div>
    </section>
  )
}
