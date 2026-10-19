import homeCopy from '@/content/home.json'
import workCopy from '@/content/workWithMe.json'
import Seo from '@/components/Seo'
import TimelineRoute from '@/components/TimelineRoute'
import { RotatingHero, type Slot } from '@/components/RotatingHeadline'
import { useAllowMotion } from '@/lib/useAllowMotion'
import { Problem } from '@/components/home/Problem'
import { Solution } from '@/components/home/Solution'

/* "product" pushes up first, then "clear" pushes down. */
const slots: Record<string, Slot> = {
  product: { push: 'up', order: 0 },
  clear: { push: 'down', order: 1 },
}

export default function WorkWithMe() {
  const allowMotion = useAllowMotion()

  return (
    <main>
      <Seo
        title="Work with me"
        description="Senior product design for founders of complex B2B, AI and dev-tool products: diagnose what's unclear, plan the fixes, and build them with your team."
        path="/work-with-me"
      />
      <RotatingHero
        availability={homeCopy.availability}
        lines={workCopy.headlineLines}
        rotation={workCopy.headlineRotation}
        slots={slots}
        supportingCopy={workCopy.supportingCopy}
      />
      <div className="relative">
        <Problem />
        <Solution />
        <TimelineRoute animate={allowMotion} />
      </div>
    </main>
  )
}
