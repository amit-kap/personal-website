/* Home "Recent Work": a row of company tiles, each linking to its work page.
   Tiles tilt toward the cursor and orbit light spots round their border. */
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Work } from '@/lib/content'
import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import { useTilt } from '@/lib/useTilt'
import { logoFor } from '@/lib/workLogos'
import { bandClass, innerClass, labelClass } from './layout'

export function RecentWork({ works }: { works: Work[] }) {
  const { recentWork } = homeCopy
  const outcomes = recentWork.outcomes as Record<string, string>
  /* Border glow spots per company: the logo's brightest hues plus a light
     tint (darker logo colours would not show on the dark tile). */
  const glow = recentWork.glow as Record<string, string[]>
  const tiles = works.filter((work) => outcomes[work.slug])
  const tilt = useTilt()
  return (
    <section className={`${bandClass} py-20`}>
      <div className={innerClass}>
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {recentWork.label}
        </Reveal>
        {/* Square tiles: two columns on phones, one row from md up. */}
        <Reveal className="grid grid-cols-2 gap-4 md:flex">
          {tiles.map((work) => {
            const company = work.company.replace(/ Software$/, '')
            const logo = logoFor(work.slug)
            return (
              <Link
                key={work.slug}
                to={`/work/${work.slug}`}
                aria-label={`${company} case study: ${outcomes[work.slug]}`}
                {...tilt}
                style={
                  glow[work.slug]
                    ? ({
                        '--spot-1': glow[work.slug][0],
                        '--spot-2': glow[work.slug][1],
                        '--spot-3': glow[work.slug][2],
                      } as CSSProperties)
                    : undefined
                }
                className="tilt group relative flex aspect-square items-center justify-center rounded-container border border-border bg-background md:flex-1"
              >
                {/* Logo and name sit as one group: at rest it is offset so
                    the logo alone is centred; on hover the logo rises, the
                    name drops in below, and the pair ends up centred. */}
                <span className="tilt-content tilt-reveal flex flex-col items-center gap-4">
                  {logo && <img src={logo} alt="" width={40} height={40} className="size-10" />}
                  <span aria-hidden="true" className="tilt-reveal-label text-body leading-[1.25] text-foreground">
                    {company}
                  </span>
                </span>
                <span aria-hidden="true" className="tilt-glare" />
                {/* Light spots orbiting the border on hover, with a pulsing glow. */}
                <span aria-hidden="true" className="pulse-border">
                  <span className="pulse-glow">
                    <span className="pulse-ring" />
                  </span>
                  <span className="pulse-ring" />
                </span>
              </Link>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
