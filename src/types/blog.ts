export interface BlogPost {
  _id: string
  slug: string
  title: string
  content: string
  description?: string
  createdAt?: string | Date
  image?: string
  author?: string
}
