import homeCopy from '@/content/home.json'
import workCopy from '@/content/workWithMe.json'
import Seo from '@/components/Seo'
import { RotatingHero, type Slot } from '@/components/RotatingHeadline'
import { Problem } from '@/components/home/Problem'
import { Solution } from '@/components/home/Solution'
import { JourneyMotion } from '@/components/home/JourneyMotion'

/* "product" pushes up first, then "clear" pushes down. */
const slots: Record<string, Slot> = {
  product: { push: 'up', order: 0 },
  clear: { push: 'down', order: 1 },
}

export default function WorkWithMe() {
  return (
    <main>
      <Seo
        title="Work with me"
        description="Senior product design for founders of complex B2B, AI and dev-tool products: diagnose what's unclear, plan the fixes, and build them with your team."
        path="/work-with-me"
      />
      <RotatingHero
        availability={homeCopy.availability}
        availabilityLink={{
          to: 'mailto:amitka111@gmail.com',
          label: `${homeCopy.availability}: email Amit`,
          event: 'contact-email',
        }}
        lines={workCopy.headlineLines}
        rotation={workCopy.headlineRotation}
        slots={slots}
        supportingCopy={workCopy.supportingCopy}
      />
      <JourneyMotion>
        <Problem />
        <Solution />
      </JourneyMotion>
    </main>
  )
}
