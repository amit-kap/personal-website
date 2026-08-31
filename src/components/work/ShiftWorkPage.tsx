import { Link } from 'react-router-dom'
import type { Work } from '@/lib/content'
import Reveal from '@/components/Reveal'
import {
  BackToHome,
  HeroBackdrop,
  ReadLink,
  SplitSection,
  TitleBlock,
  ZoomableImage,
} from '@/components/work/casePrimitives'
import { imageFor } from '@/lib/workImages'

const GRADIENT: [string, string, string] = ['#191040', '#4630b8', '#8a76f0']

const features = [
  {
    eyebrow: 'The Daily Home',
    title: 'The home reads like a console, not a report',
    copy: 'The supervisor starts with one question: "What needs me today?" The home prioritizes counts, urgency, and in-flight work before drill-down. Status carries the hierarchy; decoration carries nothing.',
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
    copy: "The agent's work arrives in a reviewable structure: mapped evidence, proposed verdicts, and drafted follow-ups. The interface reserves its strongest moments for the calls only a person should make.",
    image: '07-assessment-flow-1',
    alt: 'Shift assessment flow',
  },
]

export default function ShiftWorkPage({ work }: { work: Work }) {
  return (
    <main>
      <TitleBlock
        meta="Third-Party Risk  ·  Founding Designer  ·  2024–Now  ·  TLV"
        title="Designing Shift's agent-led third-party security platform from product model to shipped system."
        intro="I joined Shift as its first designer. I helped define the human-agent operating model, then built the design system, onboarding, and core workflows connecting vendor evidence, access, exposure, and risk decisions. Shift is now publicly available."
      />
      <HeroBackdrop
        image={imageFor(work, '01-shift-dashboard')}
        video={`${import.meta.env.BASE_URL}shift-walk.mp4`}
        alt="Shift product walkthrough: vendor evidence, access, exposure, and assessment decisions"
        gradient={GRADIENT}
      />

      <SplitSection eyebrow="The Starting Point" stmt="The product model and the interface had to develop together">
        <p className="body-copy">
          The design system could not wait for the product, and the product could not wait for the system: every screen built the language it was written in. Each workflow tested the components, density, and behavior the next one would use.
        </p>
        <p className="body-copy">
          The product is built around an agent that performs assessment work while a person supervises it. The market scan, operating-model decision, and product strategy behind that structure are documented in{' '}
          <Link to="/case-studies/designing-for-the-supervisor" className="border-b border-border text-foreground transition-colors hover:text-accent">
            Designing for the Supervisor
          </Link>
          . This page focuses on how that direction became a working system.
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
            <p className="body-copy">Onboarding takes a new customer from login through connected data sources to a vendor inventory populated with usable context.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-[17px] font-medium">The core surfaces</h3>
            <p className="body-copy">Vendor evidence, access, exposure, and assessment decisions could each become a separate tool. The product needed one model a supervisor could understand and navigate.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-[17px] font-medium">Human-agent supervision</h3>
            <p className="body-copy">Define where the agent can act, where it must ask, and what evidence a person needs before making the final decision.</p>
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
                <ZoomableImage image={imageFor(work, feature.image)} alt={feature.alt} />
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <SplitSection eyebrow="Results" stmt="A public product built on these foundations">
        <p className="body-copy">
          Shift is now publicly available. Its product foundation includes the design system, onboarding, vendor inventory, access graph, operating console, and assessment workflows shown here.
        </p>
        <p className="text-meta text-muted-foreground">Note: adoption and usage details can be shared in a private setting.</p>
      </SplitSection>

      <SplitSection eyebrow="The Strategy Story" stmt="Why the product is organized around a supervisor">
        <p className="body-copy">
          The market scan, early directions, stakeholder decision, and product-strategy reframe are written up separately.
        </p>
        <ReadLink to="/case-studies/designing-for-the-supervisor" label="Read: Designing for the Supervisor" />
      </SplitSection>

      <BackToHome />
    </main>
  )
}
