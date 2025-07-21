import PackCard from "@/components/PackCard";
import SectionTitle from "@/components/SectionTitle";
import SectionWrapper from "@/components/SectionWrapper";
import type { Pack } from "@/types/product";

const dummyPacks: Pack[] = [
  {
    _id: "1",
    slug: "starter",
    title: "Pack Starter",
    description: "Les essentiels pour bien commencer",
    image: "/packs/starter.jpg",
    price: 29.99,
  },
  {
    _id: "2",
    slug: "premium",
    title: "Pack Premium",
    description: "Le top de la qualité réunie",
    image: "/packs/premium.jpg",
    price: 59.99,
  },
];

export default function PacksPage() {
  return (
    <SectionWrapper>
      <SectionTitle title="Nos Packs" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {dummyPacks.map((pack) => (
          <PackCard key={pack.slug} pack={pack} />
        ))}
      </div>
    </SectionWrapper>
  );
}
