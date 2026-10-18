/* Home "Work with me": a short pitch for founders, linking to the full page. */
import { Link } from 'react-router-dom'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import { accentRevealButton } from '@/components/actionButtons'
import { RevealArrow } from '@/components/icons'
import { bandClass, innerClass, labelClass } from './layout'

export function WorkWithMeTeaser() {
  const { workWithMe } = homeCopy
  return (
    <section className={`${bandClass} pt-10 pb-20`}>
      <div className={`${innerClass} items-center`}>
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {workWithMe.label}
        </Reveal>
        <Reveal as="p" delay={0.08} className="max-w-[640px] text-center font-heading text-section font-normal text-balance text-foreground">
          {workWithMe.text}
        </Reveal>
        <Reveal delay={0.16} className="pt-4">
          <RevealButton
            render={<Link to="/work-with-me" />}
            nativeButton={false}
            role="link"
            aria-label={`${workWithMe.label}: see how I help founders`}
            label={workWithMe.cta}
            iconSide="end"
            className={accentRevealButton}
          >
            <RevealArrow />
          </RevealButton>
        </Reveal>
      </div>
    </section>
  )
}
