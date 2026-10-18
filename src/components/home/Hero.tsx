/* Home hero: the title is Senior / Product Designer, each word rotating
   through its list in home.json and pushing in from a different side. */
import homeCopy from '@/content/home.json'
import { RotatingHero, type Slot } from '@/components/RotatingHeadline'

/* Top word first, then left, then right. */
const slots: Record<string, Slot> = {
  Senior: { push: 'up', order: 0 },
  Product: { push: 'down', order: 1 },
  Designer: { push: 'right', order: 2 },
}

export function Hero() {
  return (
    <RotatingHero
      availability={homeCopy.availability}
      lines={homeCopy.headlineLines}
      rotation={homeCopy.headlineRotation}
      slots={slots}
      supportingCopy={homeCopy.supportingCopy}
    />
  )
}
