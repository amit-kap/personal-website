import { Link } from 'react-router-dom'
import PrevNextNav from '@/components/PrevNextNav'
import type { ContentImage, Work } from '@/lib/content'

function imageFor(work: Work, filename: string): ContentImage | undefined {
  return work.bodyImages[filename]
}

function ProductImage({ image, alt }: { image?: ContentImage; alt: string }) {
  if (!image) return null
  return (
    <img
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      className="h-full w-full object-cover"
    />
  )
}

function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow eyebrow-section ${className}`}>{children}</p>
}

export default function ShiftWorkPage({ work, next }: { work: Work; next?: Work }) {
  const dashboard = imageFor(work, '01-shift-dashboard.png')
  const inventory = imageFor(work, '02-inventory-vendors-page.png')
  const accessGraph = imageFor(work, '04-vendor-access-graph.png')
  const threatCenter = imageFor(work, '05-threat-center.png')
  const assessment = imageFor(work, '07-assessment-flow-1.jpg')

  return (
    <main className="v2-page bg-background">
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-20">
        <Link to="/#work" className="eyebrow eyebrow-project inline-flex items-center gap-2 transition-colors hover:text-foreground">
          <span aria-hidden="true">←</span> Work
        </Link>
        <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow eyebrow-page">01 / Shift / Founding Designer / 2024—now</p>
            <h1 className="mt-6 max-w-3xl font-heading text-hero font-bold tracking-[-0.078em] text-foreground">
              Third-party risk, continuously defended.
            </h1>
          </div>
          <p className="max-w-xl text-[clamp(1.25rem,2vw,1.7rem)] leading-[1.43] tracking-[-0.035em] text-foreground/70">
            A vendor-security system that turns periodic assessment files into a living operating record for evidence, access, exposure, and human decision-making.
          </p>
        </div>

        <div className="mt-16 overflow-hidden rounded-[20px] bg-[#f2efff] p-3 sm:mt-20 sm:p-6">
          <div className="aspect-[2/1] overflow-hidden rounded-[12px] bg-white">
            <ProductImage image={dashboard} alt="Shift dashboard showing vendor, access, finding, and threat context" />
          </div>
        </div>
      </section>

      <section className="border-y border-foreground/10 bg-[#121212] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <Eyebrow className="text-white/55">Before Shift</Eyebrow>
          <div>
            <h2 className="max-w-4xl font-heading text-feature font-bold tracking-[-0.07em]">
              A vendor was a file someone hoped to revisit.
            </h2>
            <div className="mt-9 max-w-2xl space-y-5 text-[1.08rem] leading-[1.55] text-white/68">
              <p>Large organisations assess, approve, and periodically review thousands of vendors through questionnaires, certificates, trust centres, spreadsheets, and follow-ups.</p>
              <p>That administrative fatigue becomes a security problem. A vendor can be trustworthy at approval, breached months later, and still hold access to critical systems and sensitive data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <Eyebrow>01 / The living record</Eyebrow>
          <h2 className="mt-5 max-w-md font-heading text-section font-bold tracking-[-0.065em] text-foreground">
            A vendor becomes security context.
          </h2>
          <p className="mt-7 max-w-md text-body leading-[1.55] text-muted-foreground">
            The inventory moves beyond a procurement list. It brings identity sources, detected access, governance state, data sensitivity, AI exposure, and risk into one record that can keep changing with the relationship.
          </p>
        </div>
        <div className="overflow-hidden rounded-[18px] bg-[#f4f2ff] p-3 sm:p-5">
          <ProductImage image={inventory} alt="Shift vendor inventory with access, governance, and risk context" />
        </div>
      </section>

      <section className="bg-[#eae8e2]">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <Eyebrow>02 / Relationship context</Eyebrow>
              <h2 className="mt-5 max-w-xl font-heading text-section font-bold tracking-[-0.067em] text-foreground">
                Access makes the real exposure visible.
              </h2>
            </div>
            <p className="max-w-xl text-lead leading-[1.45] text-foreground/65">
              A vendor event only matters in relation to the organisation. The access graph connects the vendor to identities, permissions, resources, and the data those relationships can reach.
            </p>
          </div>
          <div className="mt-14 overflow-hidden rounded-[18px] bg-white p-3 sm:mt-20 sm:p-6">
            <ProductImage image={accessGraph} alt="Shift access graph connecting a vendor to identities, permissions, and resources" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="order-2 overflow-hidden rounded-[18px] bg-[#f8f8f8] p-3 sm:p-5 lg:order-1">
          <ProductImage image={threatCenter} alt="Shift Threat Center connecting a vendor security event to the organisation's exposure" />
        </div>
        <div className="order-1 lg:order-2">
          <Eyebrow>03 / Continuous response</Eyebrow>
          <h2 className="mt-5 font-heading text-section font-bold tracking-[-0.067em] text-foreground">
            Monitoring replaces the forgotten assessment.
          </h2>
          <p className="mt-7 max-w-md text-body leading-[1.55] text-muted-foreground">
            When a threat appears, Shift connects the event to vendor access, affected assets, and relationship criticality. The team sees the exposure before deciding whether the relationship or access must change.
          </p>
        </div>
      </section>

      <section className="bg-[#7654f4] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Eyebrow className="text-white/72">04 / Human responsibility</Eyebrow>
            <h2 className="mt-5 max-w-xl font-heading text-section font-bold tracking-[-0.07em]">
              The agent does the work. People make the decisions.
            </h2>
            <p className="mt-7 max-w-md text-body leading-[1.55] text-white/80">
              Agents collect evidence, assess controls, follow up, maintain reviews, and watch for change. They explain their work, surface uncertainty, and ask for judgment. The vendor-risk team decides trust; the SOC decides restriction or containment.
            </p>
          </div>
          <div className="overflow-hidden rounded-[18px] bg-white p-3 sm:p-5">
            <ProductImage image={assessment} alt="Shift assessment flow showing an agent recommendation and a human review decision" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.72fr_1.28fr]">
        <Eyebrow>My contribution</Eyebrow>
        <div>
          <h2 className="max-w-4xl font-heading text-section font-bold tracking-[-0.07em] text-foreground">
            Designing a product people can trust before it asks them to trust an agent.
          </h2>
          <p className="mt-8 max-w-2xl text-lead leading-[1.48] text-foreground/68">
            As Founding Designer, I shaped the system, onboarding, and core product surfaces end to end. The key trade-off was never to claim autonomy where the consequences still require human accountability: make the evidence legible, make intervention possible, and keep consequential decisions with people.
          </p>
          <PrevNextNav next={next ? { to: `/work/${next.slug}`, label: next.company } : undefined} />
        </div>
      </section>
    </main>
  )
}
