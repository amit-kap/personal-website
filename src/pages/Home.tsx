import { useRef } from 'react'
import Hero from '@/components/home/Hero'
import FeaturedCaseStudy from '@/components/home/FeaturedCaseStudy'
import RecentWork from '@/components/home/RecentWork'
import CaseStudies from '@/components/home/CaseStudies'
import { useScrollMotion } from '@/lib/useScrollMotion'

export default function Home() {
  const scope = useRef<HTMLDivElement>(null)
  useScrollMotion(scope)

  return (
    <div ref={scope} className="relative z-10 bg-background">
      <Hero />
      <FeaturedCaseStudy />
      <RecentWork />
      <CaseStudies />
    </div>
  )
}
