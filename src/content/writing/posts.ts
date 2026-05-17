export interface PostMeta {
  slug: string
  title: string
  subtitle?: string
  excerpt: string
  date: string
  readMin: number
}

export const posts: PostMeta[] = [
  {
    slug: 'sailing-the-data-oceans',
    title: 'Sailing the Data Oceans',
    subtitle: 'Or how we assisted our users in maximizing the use of our product',
    excerpt: 'How we helped Veriti users wade through their data with a filtering pattern that scales.',
    date: '2024',
    readMin: 6,
  },
  {
    slug: 'falling-down-the-rabbit-hole',
    title: 'Falling Down The Rabbit Hole',
    subtitle: 'Or how we handled a B2C project in a B2B corporate',
    excerpt: 'Handling a B2C project inside a B2B corporate — a Check Point SMB mobile app story.',
    date: '2019',
    readMin: 6,
  },
]

export function getPostMeta(slug: string): PostMeta | undefined {
  return posts.find(p => p.slug === slug)
}
