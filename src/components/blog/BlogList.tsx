import BlogCard from './BlogCard'

export default function BlogList({ articles }: { articles: any[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {articles.map((a) => (
        <BlogCard key={a._id} article={a} />
      ))}
    </div>
  )
}
