import Link from "next/link";

interface PackProps {
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
}

export default function PackCard({ slug, title, description, image, price }: PackProps) {
  return (
    <Link href={`/packs/${slug}`} className="block border rounded-xl hover:shadow-lg transition overflow-hidden">
      <img src={image} alt={title} className="w-full h-56 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        <div className="mt-4 text-lg font-bold">{price.toFixed(2)} €</div>
      </div>
    </Link>
  );
}
