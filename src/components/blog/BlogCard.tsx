import Link from 'next/link'

export default function BlogCard({ article }: { article: any }) {
  return (
    <Link href={`/blog/${article.slug}`} className="block border rounded-lg p-4 shadow hover:shadow-md transition">
      <h3 className="font-bold text-lg mb-2">{article.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3">{article.description}</p>
    </Link>
  )
}
