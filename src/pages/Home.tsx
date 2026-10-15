import { getAllWorks } from '@/lib/content'
import Seo from '@/components/Seo'
import FlowOverlay from '@/components/FlowOverlay'
import { useAllowMotion } from '@/lib/useAllowMotion'
import { Hero } from '@/components/home/Hero'
import { Featured } from '@/components/home/Featured'
import { RecentWork } from '@/components/home/RecentWork'
import { Problem } from '@/components/home/Problem'
import { Solution } from '@/components/home/Solution'

export default function Home() {
  const works = getAllWorks()
  const allowMotion = useAllowMotion()

  return (
    <main>
      <Seo
        title="Amit Kaplinsky | Senior Product Designer"
        description="Senior product designer for founders building complex B2B, AI, or dev tools. More than a decade designing cybersecurity products, from product direction and design systems to AI-assisted builds that ship."
        path="/"
      />
      <Hero />
      <Featured />
      <RecentWork works={works} />
      <div className="relative">
        <Problem />
        <Solution />
        <FlowOverlay animate={allowMotion} />
      </div>
    </main>
  )
}
