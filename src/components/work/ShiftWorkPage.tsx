import { Link } from 'react-router-dom'
import type { Work } from '@/lib/content'
import Reveal from '@/components/Reveal'
import {
  BackToHome,
  HeroBackdrop,
  ReadLink,
  SplitSection,
  TitleBlock,
} from '@/components/work/casePrimitives'
import { imageFor } from '@/lib/workImages'

const GRADIENT: [string, string, string] = ['#191040', '#4630b8', '#8a76f0']

const features = [
  {
    eyebrow: 'The Daily Home',
    title: 'The home reads like a console, not a report',
    copy: 'The first question a supervisor has is "what needs me today?", so the home leads with attention: counts, urgency, and in-flight work first, drill-down second. Status carries the hierarchy; decoration carries nothing.',
    image: '01-shift-dashboard',
    alt: 'Shift home dashboard',
  },
  {
    eyebrow: 'The Living Record',
    title: 'A vendor is a record, not a point-in-time review',
    copy: "The inventory treats every vendor as a continuously maintained record of evidence, access, exposure, and decisions in one place, so any assessment starts from what's already known instead of a blank questionnaire.",
    image: '02-inventory-vendors-page',
    alt: 'Shift vendor inventory',
  },
  {
    eyebrow: 'Who Connects to What',
    title: 'Exposure you can see, not infer',
    copy: 'Vendor risk only means something against what the vendor can actually touch. The access graph maps vendors to systems and data, turning exposure from a spreadsheet abstraction into something you can point at.',
    image: '04-vendor-access-graph',
    alt: 'Shift vendor access graph',
  },
  {
    eyebrow: 'Where Judgment Lands',
    title: 'The assessment keeps the decisions visibly human',
    copy: "The agent's work arrives structured: evidence mapped, verdicts proposed, followups drafted. The interface reserves its strongest moments for the calls only a person should make.",
    image: '07-assessment-flow-1',
    alt: 'Shift assessment flow',
  },
]

export default function ShiftWorkPage({ work }: { work: Work }) {
  return (
    <main>
      <TitleBlock
        meta="Third-Party Risk  ·  Founding Designer  ·  2024–Now  ·  TLV"
        title="Founding design at Shift: a vendor-security platform, built from zero."
        intro="I joined Shift as the first designer: no design system, no onboarding, and core product surfaces still to be invented. This page is about what got built: the system and the surfaces that connect vendor evidence, access, exposure, and assessment decisions. The product is now out of stealth."
      />
      <HeroBackdrop
        image={imageFor(work, '01-shift-dashboard')}
        video={`${import.meta.env.BASE_URL}shift-walk.mp4`}
        alt="Shift product walkthrough: vendor evidence, access, exposure, and assessment decisions"
        gradient={GRADIENT}
      />

      <SplitSection eyebrow="The Starting Point" stmt="Everything at once: a system to found and surfaces to ship">
        <p className="body-copy">
          Founding design means the foundations and the product ship together. The design system couldn't wait for the surfaces, and the surfaces couldn't wait for the system; every screen built the language it was written in.
        </p>
        <p className="body-copy">
          One thing shaped everything: the product is built around an agent that does the assessment work while a person supervises it. The market scan and the reframe behind that operating model are their own story, told in{' '}
          <Link to="/case-studies/designing-for-the-supervisor" className="border-b border-border text-foreground transition-colors hover:text-accent">
            Designing for the Supervisor
          </Link>
          . This page stays on the design side of that line.
        </p>
      </SplitSection>

      <SplitSection eyebrow="The Job" stmt="Four domains, one navigable product">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-[17px] font-medium">A design system from zero</h3>
            <p className="body-copy">Tokens, components, and density rules for a data-heavy security product: one language across dashboards, records, graphs, and conversations.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-[17px] font-medium">Onboarding</h3>
            <p className="body-copy">A security product is only alive once it's connected, so onboarding takes a new customer from login to integrated data sources to a populated vendor inventory.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-[17px] font-medium">The core surfaces</h3>
            <p className="body-copy">Vendor evidence, access, exposure, and assessment decisions each pull toward their own tool. The design job was making them one product a person can hold in their head.</p>
          </div>
        </div>
      </SplitSection>

      {features.map((feature) => (
        <section key={feature.eyebrow} className="relative border-t border-border">
          <div className="inner-col flex flex-col gap-[18px] pb-14 pt-12">
            <Reveal as="p" className="eyebrow">{feature.eyebrow}</Reveal>
            <Reveal as="h2" className="font-heading text-title-sm font-medium tracking-[-0.01em]" delay={0.06}>
              {feature.title}
            </Reveal>
            <Reveal as="p" className="body-copy max-w-[760px]" delay={0.12}>{feature.copy}</Reveal>
            <Reveal>
              <div
                className="backdrop h-[clamp(240px,39vw,560px)]"
                style={{ '--g1': GRADIENT[0], '--g2': GRADIENT[1], '--g3': GRADIENT[2] } as React.CSSProperties}
              >
                {(() => {
                  const image = imageFor(work, feature.image)
                  return image ? (
                    <img src={image.src} alt={feature.alt} width={image.width} height={image.height} loading="lazy" className="backdrop-media" />
                  ) : null
                })()}
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <SplitSection eyebrow="Results" stmt="Out of stealth on these foundations">
        <p className="body-copy">
          The design system, onboarding, and core surfaces shipped as the product's foundation, and Shift is now out of stealth. Everything on this page is the shipped product, not concept work.
        </p>
        <p className="text-meta text-muted-foreground">Note: adoption and usage details can be shared in a private setting.</p>
      </SplitSection>

      <SplitSection eyebrow="The Strategy Story" stmt="How this product came to be shaped around a supervisor">
        <p className="body-copy">
          The thinking behind the operating model, from the market scan through the wrong turns to the reframe that changed what the screens are for, is written up as its own piece, not repeated here.
        </p>
        <ReadLink to="/case-studies/designing-for-the-supervisor" label="Read: Designing for the Supervisor" />
      </SplitSection>

      <BackToHome />
    </main>
  )
}
