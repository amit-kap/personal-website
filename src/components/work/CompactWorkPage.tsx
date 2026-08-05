import type { ContentImage, Work } from '@/lib/content'

type CompactStory = {
  lede: string
  heroImage: string
  proofImage?: string
  problemTitle: string
  problem: string
  responseTitle: string
  response: string
  contribution: string
  heroPlate: string
  problemBg: string
  problemAccent: string
  proofPlate: string
}

const stories: Record<string, CompactStory> = {
  'onyxia-cyber': {
    lede: 'A data-management layer that lets the CISO connect executive intent to the ownership, progress, and delay behind daily security work.',
    heroImage: '01-SSM-1',
    proofImage: '04-insights',
    problemTitle: 'Accountability without ownership is just another report.',
    problem: 'CISOs are accountable for the whole security program, yet often receive information indirectly: summarised by teams, detached from the work, and out of date by the time it reaches them.',
    responseTitle: 'One data model, from decision to task.',
    response: 'The product connected security tools, BI, Jira, ServiceNow, and operational systems. A benchmark or SLA could lead to the task, owner, progress, and reason a commitment was delayed.',
    contribution: 'As Product Design Lead in a short engagement, I helped shape this new CISO persona and the experience spanning daily operations through board-level budget conversations.',
    heroPlate: '#e4d8eb',
    problemBg: '#292431',
    problemAccent: '#f0b5ff',
    proofPlate: '#eaddec',
  },
  veriti: {
    lede: 'A security-controls platform that closes the gap between knowing a weakness exists and configuring existing defences to stop it.',
    heroImage: '04',
    proofImage: '02',
    problemTitle: 'Knowing the threat is not the same as fixing the exposure.',
    problem: 'Most organisations already own the right security products, but no team can continuously configure every control across a large multi-vendor stack.',
    responseTitle: 'Make a recommendation safe enough to approve.',
    response: 'Veriti connected a threat to the configuration gap, affected products, and expected effect—turning one finding into a controlled change rather than another dashboard.',
    contribution: 'As Founding Designer, I shaped how a consequential recommendation becomes understandable and trustworthy before anyone applies a remediation.',
    heroPlate: '#e9ddff',
    problemBg: '#291047',
    problemAccent: '#ffcf6f',
    proofPlate: '#eee5ff',
  },
  semperis: {
    lede: 'The move from an exceptional Active Directory recovery product to a continuously operating identity-security platform.',
    heroImage: '01-semperis',
    problemTitle: 'Recovery is a defined task. Prevention is a changing state.',
    problem: 'Backup and restore had a clear beginning and end. Continuous security introduced vulnerabilities, dangerous configurations, severity, urgency, changing states, and a growing volume of findings.',
    responseTitle: 'A product language for attention and action.',
    response: 'The design work defined how alerts, insights, and notifications differ—and how security teams move from a detected weakness to the decision that needs attention.',
    contribution: 'I led the transition in UX and visual language, helping Semperis grow from recovery into a platform that increasingly prevents the incident it was built to repair.',
    heroPlate: '#f0d8e2',
    problemBg: '#3a2430',
    problemAccent: '#ffb5ce',
    proofPlate: '#f0e3e7',
  },
  checkpoint: {
    lede: 'A management redesign that turned a fragmented enterprise interface into one coherent system for daily security work.',
    heroImage: '05-dashboard',
    proofImage: '01-details',
    problemTitle: 'Twenty tabs made the organisation’s structure the user’s job.',
    problem: 'Years of products and features had accumulated into separate management surfaces. Administrators needed to understand how the company had built the platform before they could operate it.',
    responseTitle: 'One information architecture for security at scale.',
    response: 'The redesign rethought the relationship between products, objects, policies, alerts, and daily tasks—then gave that structure a modern, coherent interface.',
    contribution: 'Embedded with R&D through a nearly two-year program involving hundreds of developers, I translated deeply technical requirements into flows, prototypes, and production-ready behaviour.',
    heroPlate: '#e5e5df',
    problemBg: '#273036',
    problemAccent: '#d9f46d',
    proofPlate: '#e7e3dc',
  },
}

function imageFor(work: Work, filename: string): ContentImage | undefined {
  return Object.entries(work.bodyImages).find(([key]) => key.startsWith(filename))?.[1]
}

function ProductImage({ image, alt }: { image?: ContentImage; alt: string }) {
  if (!image) return null
  return (
    <img
      src={image.src}
      alt={alt}
      width={image.width}
      height={image.height}
      className="h-full w-full rounded-[16px] object-cover"
    />
  )
}

function Eyebrow({ children, inverse = false }: { children: string; inverse?: boolean }) {
  return <p className={`eyebrow eyebrow-section ${inverse ? 'eyebrow-inverse' : ''}`}>{children}</p>
}

export default function CompactWorkPage({ work }: { work: Work }) {
  const story = stories[work.slug]
  if (!story) return null

  const heroImage = imageFor(work, story.heroImage) ?? work.heroImage
  const proofImage = story.proofImage ? imageFor(work, story.proofImage) : undefined

  return (
    <main className="v2-page bg-background">
      <section className="mx-auto max-w-[1440px] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:pt-32">
        <h1 className="max-w-5xl font-heading text-feature font-bold tracking-[-0.07em] text-foreground">
          {work.productTitle}
        </h1>
        <div className="mt-7 max-w-3xl">
          <div className="text-meta leading-5 tracking-[-0.02em] text-muted-foreground">
            <p className="font-medium">{work.company} · {work.role}</p>
            <p className="mt-1 text-muted-foreground/75">{work.period}</p>
          </div>
          <p className="mt-7 text-lead leading-[1.43] tracking-[-0.035em] text-foreground/70">{story.lede}</p>
        </div>

        {heroImage && (
          <div className="mt-14 overflow-hidden rounded-[40px] p-6 sm:mt-20" style={{ backgroundColor: story.heroPlate }}>
            <div className="aspect-[2/1] overflow-hidden rounded-[16px] bg-white">
              <ProductImage image={heroImage} alt={`${work.company} product interface`} />
            </div>
          </div>
        )}
      </section>

      <section style={{ backgroundColor: story.problemBg }} className="text-white">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <Eyebrow inverse>What had to change</Eyebrow>
          <div>
            <h2 className="max-w-4xl font-heading text-section font-bold tracking-[-0.07em]" style={{ color: story.problemAccent }}>
              {story.problemTitle}
            </h2>
            <p className="mt-8 max-w-2xl text-body leading-[1.55] text-white/72">{story.problem}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
        <div>
          <Eyebrow>The design response</Eyebrow>
          <h2 className="mt-5 max-w-md font-heading text-section font-bold tracking-[-0.067em] text-foreground">
            {story.responseTitle}
          </h2>
          <p className="mt-7 max-w-md text-body leading-[1.55] text-muted-foreground">{story.response}</p>
          <p className="mt-7 max-w-md text-body leading-[1.55] text-foreground/78">{story.contribution}</p>
        </div>
        {proofImage ? (
          <div className="overflow-hidden rounded-[40px] p-6" style={{ backgroundColor: story.proofPlate }}>
            <ProductImage image={proofImage} alt={`${work.company} product detail`} />
          </div>
        ) : (
          <div className="min-h-[260px] rounded-[40px] p-8 sm:p-12" style={{ backgroundColor: story.proofPlate }}>
            <p className="max-w-lg font-heading text-title-sm font-bold leading-[1.02] tracking-[-0.05em] text-foreground/82">
              A new language for risk, urgency, state, and the next action.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
