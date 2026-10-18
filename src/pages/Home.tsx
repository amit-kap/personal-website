import { getAllWorks } from '@/lib/content'
import Seo from '@/components/Seo'
import { Hero } from '@/components/home/Hero'
import { Featured } from '@/components/home/Featured'
import { RecentWork } from '@/components/home/RecentWork'
import { WorkWithMeTeaser } from '@/components/home/WorkWithMeTeaser'

export default function Home() {
  const works = getAllWorks()

  return (
    <main>
      <Seo
        title="Amit Kaplinsky | Senior Product Designer"
        description="Senior product designer with more than a decade designing cybersecurity products, from product direction and design systems to AI-assisted builds that ship."
        path="/"
      />
      <Hero />
      <Featured />
      <RecentWork works={works} />
      <WorkWithMeTeaser />
    </main>
  )
}
