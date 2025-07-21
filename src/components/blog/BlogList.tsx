import BlogCard from './BlogCard'
import type { BlogPost } from '@/types/blog'

interface BlogListProps {
  articles: BlogPost[]
}

export default function BlogList({ articles }: BlogListProps) {
  if (!articles?.length) return null

  return (
    <section
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-label="Liste des articles du blog"
    >
      {articles.map((article) => (
        <BlogCard key={article._id} article={article} />
      ))}
    </section>
  )
}
