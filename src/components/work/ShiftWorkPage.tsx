import type { ContentImage, Work } from '@/lib/content'

function imageFor(work: Work, filename: string): ContentImage | undefined {
  return work.bodyImages[filename]
}

function ProductImage({ image, alt, className = 'rounded-[16px]' }: { image?: ContentImage; alt: string; className?: string }) {
  if (!image) return null
  return (
    <img
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      className={`h-full w-full object-cover ${className}`}
    />
  )
}

function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow eyebrow-section ${className}`}>{children}</p>
}

export default function ShiftWorkPage({ work }: { work: Work }) {
  const dashboard = imageFor(work, '01-shift-dashboard.webp')
  const inventory = imageFor(work, '02-inventory-vendors-page.webp')
  const accessGraph = imageFor(work, '04-vendor-access-graph.webp')
  const threatCenter = imageFor(work, '05-threat-center.webp')
  const assessment = imageFor(work, '07-assessment-flow-1.webp')

  return (
    <main className="v2-page bg-background">
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:pt-32">
        <h1 className="max-w-5xl font-heading text-hero font-bold tracking-[-0.078em] text-foreground">
          Third-party risk,<br /> continuously defended.
        </h1>
        <div className="mt-10 max-w-3xl">
          <div className="text-meta leading-5 tracking-[-0.02em] text-muted-foreground">
            <p className="font-medium">Shift · Founding Designer</p>
            <p className="mt-1 text-muted-foreground/75">{work.period}</p>
          </div>
          <p className="mt-7 text-lead leading-[1.43] tracking-[-0.035em] text-foreground/70">
            A vendor-security system that turns periodic assessment files into a living operating record for evidence, access, exposure, and human decision-making.
          </p>
        </div>

        <div className="mt-16 overflow-hidden rounded-[40px] bg-[#f4f1ff] p-6 sm:mt-20">
          <div className="aspect-[2/1] overflow-hidden rounded-[16px] bg-white">
            <ProductImage image={dashboard} alt="Shift dashboard showing vendor, access, finding, and threat context" />
          </div>
        </div>
      </section>

      <section className="bg-[#252738] text-white">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <Eyebrow className="text-white/55">Before Shift</Eyebrow>
          <div>
            <h2 className="max-w-4xl font-heading text-feature font-bold tracking-[-0.07em]">
              A vendor was a file someone hoped to revisit.
            </h2>
            <div className="mt-9 max-w-2xl space-y-5 text-body leading-[1.55] text-white/70">
              <p>Large organisations assess, approve, and periodically review thousands of vendors through questionnaires, certificates, trust centres, spreadsheets, and follow-ups.</p>
              <p>That administrative fatigue becomes a security problem. A vendor can be trustworthy at approval, breached months later, and still hold access to critical systems and sensitive data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div>
          <Eyebrow>The living record</Eyebrow>
          <h2 className="mt-5 max-w-md font-heading text-section font-bold tracking-[-0.065em] text-foreground">
            A vendor becomes security context.
          </h2>
          <p className="mt-7 max-w-md text-body leading-[1.55] text-muted-foreground">
            The inventory moves beyond a procurement list. It brings identity sources, detected access, governance state, data sensitivity, AI exposure, and risk into one record that can keep changing with the relationship.
          </p>
        </div>
        <div className="overflow-hidden rounded-[40px] bg-[#e2e6fb] p-6">
          <ProductImage image={inventory} alt="Shift vendor inventory with access, governance, and risk context" />
        </div>
      </section>

      <section className="bg-[#eae8e2]">
        <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 sm:py-32">
          <Eyebrow>Relationship context</Eyebrow>
          <div className="mt-5 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <h2 className="max-w-xl font-heading text-section font-bold tracking-[-0.067em] text-foreground">
                Access makes the real exposure visible.
              </h2>
            </div>
            <p className="max-w-xl text-body leading-[1.55] text-muted-foreground">
              A vendor event only matters in relation to the organisation. The access graph connects the vendor to identities, permissions, resources, and the data those relationships can reach.
            </p>
          </div>
          <div className="mt-14 overflow-hidden rounded-[40px] bg-[#efe6bd] p-6 sm:mt-20">
            <ProductImage image={accessGraph} alt="Shift access graph connecting a vendor to identities, permissions, and resources" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div className="order-2 overflow-hidden rounded-[40px] bg-[#e7e3dc] p-6 lg:order-1">
          <ProductImage image={threatCenter} alt="Shift Threat Center connecting a vendor security event to the organisation's exposure" />
        </div>
        <div className="order-1 lg:order-2">
          <Eyebrow>Continuous response</Eyebrow>
          <h2 className="mt-5 font-heading text-section font-bold tracking-[-0.067em] text-foreground">
            Monitoring replaces the forgotten assessment.
          </h2>
          <p className="mt-7 max-w-md text-body leading-[1.55] text-muted-foreground">
            When a threat appears, Shift connects the event to vendor access, affected assets, and relationship criticality. The team sees the exposure before deciding whether the relationship or access must change.
          </p>
        </div>
      </section>

      <section className="bg-[#7755f4] text-white">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.4fr_0.6fr] lg:items-stretch">
          <div className="px-5 py-24 sm:px-8 sm:py-32 lg:pr-16">
            <Eyebrow className="eyebrow-inverse">Human responsibility</Eyebrow>
            <h2 className="mt-5 max-w-xl font-heading text-section font-bold tracking-[-0.07em] text-[#ddf76b]">
                The agent does the work. People make the decisions.
            </h2>
            <p className="mt-7 max-w-md text-body leading-[1.55] text-white/82">
              Agents collect evidence, assess controls, follow up, maintain reviews, and watch for change. They explain their work, surface uncertainty, and ask for judgment. The vendor-risk team decides trust; the SOC decides restriction or containment.
            </p>
          </div>
          <div className="shift-image-bleed-right min-h-[320px] overflow-hidden lg:min-h-full">
            <ProductImage image={assessment} alt="Shift assessment flow showing an agent recommendation and a human review decision" className="rounded-l-[18px] rounded-r-none" />
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
        </div>
      </section>
    </main>
  )
}
