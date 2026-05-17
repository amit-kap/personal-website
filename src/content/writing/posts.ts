export interface PostMeta {
  slug: string
  title: string
  excerpt: string
  date: string
  readMin: number
}

export const posts: PostMeta[] = [
  {
    slug: 'sailing-the-data-oceans',
    title: 'Sailing the Data Oceans',
    excerpt: 'A field essay on designing for data-heavy environments.',
    date: '2024',
    readMin: 6,
  },
]

export function getPostMeta(slug: string): PostMeta | undefined {
  return posts.find(p => p.slug === slug)
}
