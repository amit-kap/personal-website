import { Link } from 'react-router-dom'
import type { Work } from '@/lib/content'
import {
  BackToHome,
  HeroBackdrop,
  JobGrid,
  ReadLink,
  SplitSection,
  SurfacesMosaic,
  TitleBlock,
} from '@/components/work/casePrimitives'
import { imageFor } from '@/lib/workImages'

type CompactStory = {
  meta: string
  title: string
  intro: string
  gradient: [string, string, string]
  heroImage: string
  heroAlt: string
  startingPoint: { stmt: string; paras: string[] }
  jobs: Array<{ title: string; copy: string }>
  surfaces?: {
    heading: string
    items: Array<{ image: string; alt: string; eyebrow: string; title: string; copy: React.ReactNode }>
  }
  results: { stmt: string; paras: string[] }
  related?: { stmt: string; copy: string; label: string; to: string }
}

const stories: Record<string, CompactStory> = {
  'onyxia-cyber': {
    meta: 'CISO Data  ·  Product Design Team Lead  ·  2024  ·  TLV',
    title: 'Connecting executive intent to owners, tasks, and progress at Onyxia.',
    intro: 'Onyxia proposed a data-management layer for the CISO: a connected view across security products, BI, Jira, ServiceNow, and operational systems. I joined for a short engagement to help shape the experience from executive benchmarks and SLAs through to the tasks, owners, progress, and delays behind them.',
    gradient: ['#0c1f4a', '#1d4ed8', '#60a5fa'],
    heroImage: '01-SSM-1',
    heroAlt: 'Onyxia security stack map',
    startingPoint: {
      stmt: 'The CISO owns the data',
      paras: [
        "Security leadership runs on data scattered across security products, BI, Jira, ServiceNow, and operational systems. Onyxia's concept: one shared security data model connecting all of it.",
        'My engagement was short and focused — shape the experience from executive benchmarks and SLAs down to the tasks, owners, progress, and delays behind them.',
      ],
    },
    jobs: [
      { title: 'Design team lead', copy: 'Leading product design through a short, focused engagement — April to October 2024.' },
      { title: 'Executive intent, made operational', copy: 'Benchmarks and SLAs connected to the follow-through: owners, tasks, progress, delays.' },
      { title: 'One shared data model', copy: 'A connected view across the security stack, BI, and the operational systems around it.' },
    ],
    surfaces: {
      heading: 'From benchmarks to the tasks behind them',
      items: [
        {
          image: '05-p-hub',
          alt: 'Onyxia performance hub',
          eyebrow: 'The Follow-Through',
          title: 'The Performance Hub',
          copy: 'Current score to expected score — through the in-progress and suggested tasks that move it, each with an owner and a clock.',
        },
        {
          image: '03-frameworks',
          alt: 'Onyxia frameworks builder',
          eyebrow: 'The Benchmark',
          title: 'Frameworks, weighted',
          copy: 'Executive intent expressed as a framework — weighted categories and the CPIs that measure them.',
        },
        {
          image: '02-SSM-2',
          alt: 'Onyxia security stack map budget view',
          eyebrow: 'The Stack',
          title: 'The security stack map',
          copy: 'Coverage and budget in one matrix — security functions against the assets they protect.',
        },
        {
          image: '04-insights',
          alt: 'Onyxia insights feed',
          eyebrow: 'The Signal',
          title: 'Insights, explained',
          copy: "The week's CPI movements as a readable feed — what improved, what declined, and why it matters.",
        },
      ],
    },
    results: {
      stmt: 'A short engagement, a shaped experience',
      paras: ["Six months as design lead helped shape the concept's core surfaces — the ones on this page — from executive benchmarks down to the tasks behind them."],
    },
  },
  veriti: {
    meta: 'Security Controls  ·  Founding Designer  ·  2021 — 2024  ·  TLV',
    title: 'Closing the gap between a found weakness and a safe fix at Veriti.',
    intro: 'As Founding Designer, I helped turn Veriti from a blank slate into a security-controls product. The central design problem: closing the gap between finding a weakness and safely configuring the security tools you already have to stop it.',
    gradient: ['#06302b', '#0f766e', '#2dd4bf'],
    heroImage: '02',
    heroAlt: 'Veriti security controls product',
    startingPoint: {
      stmt: 'A blank slate, and one central design problem',
      paras: [
        'Knowing is not enough. Security teams could find weaknesses; the risk lived in the distance between that knowledge and a safe configuration change across the products they already ran.',
        'So the product was designed to show what changes, where, why, and what happens — before a person approves remediation.',
      ],
    },
    jobs: [
      { title: 'Founding design from a blank slate', copy: 'Two and a half years shaping the product and its design language from zero.' },
      { title: 'Threats to configuration gaps', copy: 'Connecting a known weakness to the exact configuration change in the existing security stack.' },
      { title: 'Controlled remediation', copy: 'Approval as the accountability moment — nothing changes until a person says so.' },
    ],
    surfaces: {
      heading: 'What changes, where, why',
      items: [
        {
          image: '04',
          alt: 'Veriti insights and remediation queue',
          eyebrow: 'The Core Flow',
          title: 'From found weakness to an approved fix',
          copy: "Every insight carries its root cause and the exact change — what changes, where, why — with remediation waiting on a person's approval.",
        },
        {
          image: '05',
          alt: 'Veriti threat indicators table',
          eyebrow: 'The Data',
          title: 'Threat indicators at table scale',
          copy: (
            <>
              Tens of thousands of indicators made workable — the filtering pattern behind{' '}
              <Link to="/case-studies/sailing-the-data-oceans" className="border-b border-border text-foreground transition-colors hover:text-accent">
                Sailing the Data Oceans
              </Link>
              .
            </>
          ),
        },
        {
          image: '03',
          alt: 'Veriti security posture map',
          eyebrow: 'Posture',
          title: 'One score, and a map of what needs attention',
          copy: 'A unified posture score, with every asset placed by exposure and business impact.',
        },
        {
          image: '06',
          alt: 'Veriti Am I Protected search',
          eyebrow: 'The Question',
          title: 'Am I protected?',
          copy: "The product's simplest surface — ask about any CVE and get an answer from your own stack.",
        },
      ],
    },
    results: {
      stmt: 'From blank slate to shipped product',
      paras: ['Two and a half years of founding design took Veriti from nothing to a working security-controls product — the surfaces on this page are the shipped work.'],
    },
    related: {
      stmt: 'The filtering pattern, written up',
      copy: 'How we helped Veriti users wade through their data with a filtering pattern that scales.',
      label: 'Read — Sailing the Data Oceans',
      to: '/case-studies/sailing-the-data-oceans',
    },
  },
  semperis: {
    meta: 'Identity Security  ·  UX Team Lead  ·  2020 — 2021  ·  TLV',
    title: 'Moving Semperis from AD recovery to continuous prevention — while building the UX team.',
    intro: 'I led the transition from an Active Directory recovery product toward continuous prevention. Alongside building the in-house design team, I shaped a UX language for vulnerabilities, dangerous configurations, alerts, insights, severity, urgency, and the actions that need attention.',
    gradient: ['#37200a', '#b45309', '#fbbf24'],
    heroImage: '01-semperis',
    heroAlt: 'Semperis identity security platform',
    startingPoint: {
      stmt: 'From recovery to prevention',
      paras: [
        "Semperis was known for recovering Active Directory after the worst had happened. The product's next chapter was continuous prevention — catching evolving identity risk before it becomes the incident.",
        'That transition needed a shared vocabulary: what counts as a vulnerability, a dangerous configuration, an alert, an insight — and how severity and urgency decide what deserves attention and action.',
      ],
    },
    jobs: [
      { title: 'UX team lead', copy: 'Built and led the in-house UX team while the product found its new shape.' },
      { title: 'A language for risk', copy: 'One vocabulary for vulnerabilities, configurations, alerts, and insights — with severity and urgency carrying the hierarchy.' },
      { title: 'The product transition', copy: 'Leading the UX and visual-language move from recovery tool to continuous identity security.' },
    ],
    results: {
      stmt: 'A language and a team to carry it',
      paras: ['Fourteen months delivered two durable things: a UX language for evolving identity risk, and an in-house design team to keep building with it.'],
    },
  },
  checkpoint: {
    meta: 'Enterprise Security  ·  UX Expert  ·  2014 — 2020  ·  TLV',
    title: 'Turning twenty management tabs into one coherent system at Check Point.',
    intro: 'At Check Point I learned cybersecurity and enterprise UX at scale, working with an R&D organisation of hundreds of developers. The redesign began with fragmented management across more than twenty tabs and became a coherent information architecture for products, objects, policies, and daily security tasks.',
    gradient: ['#380a1e', '#be185d', '#f472b6'],
    heroImage: '05-dashboard',
    heroAlt: 'Check Point security management dashboard',
    startingPoint: {
      stmt: 'Twenty tabs, hundreds of developers',
      paras: [
        'Enterprise security management had grown one tab at a time — more than twenty of them — each carrying its own products, objects, and policies.',
        'Six years as UX Expert meant working with an R&D organisation of hundreds of developers to turn complex product, policy, and workflow requirements into coherent cross-platform experiences.',
      ],
    },
    jobs: [
      { title: 'UX at organisational scale', copy: 'Six years inside an R&D organisation of hundreds — where UX ships through other people.' },
      { title: 'One information architecture', copy: 'Products, objects, policies, and daily security tasks reorganised into a coherent system.' },
      { title: 'Requirements to experience', copy: 'Complex product, policy, and workflow requirements turned into cross-platform experiences.' },
    ],
    surfaces: {
      heading: 'One system, not twenty tabs',
      items: [
        {
          image: '01-details',
          alt: 'Check Point action center activities',
          eyebrow: 'The Action Center',
          title: 'One activity stream for every alert',
          copy: 'Security, system, and configuration alerts in a single triaged stream — severity carries the eye, details one click down.',
        },
        {
          image: '06-mainPage',
          alt: 'Check Point Threat Cloud portal',
          eyebrow: 'Threat Cloud',
          title: 'The public face of the intelligence',
          copy: "Check Point's threat-intelligence portal — live attack counts, research, and security updates in one place.",
        },
        {
          image: '04-timeline',
          alt: 'Check Point event timeline',
          eyebrow: 'The Timeline',
          title: 'An event traced over weeks',
          copy: 'A high-CPU event plotted across months, with confirm, remind, and hand-off actions right on the row.',
        },
        {
          image: '02-mobile',
          alt: 'Check Point mobile device pairing',
          eyebrow: 'Desktop to Mobile',
          title: 'Pairing a mobile device',
          copy: 'The bridge from the management console to mobile — a QR pairing flow inside the Action Center.',
        },
      ],
    },
    results: {
      stmt: 'Six years, one coherent system',
      paras: ['Fragmented management across twenty-plus tabs became a coherent information architecture — and the schooling in cybersecurity and enterprise UX that the rest of this portfolio is built on.'],
    },
    related: {
      stmt: 'A B2C project inside a B2B corporate',
      copy: 'Handling a consumer mobile-app project inside an enterprise organisation — the Check Point SMB story.',
      label: 'Read — Falling Down the Rabbit Hole',
      to: '/case-studies/falling-down-the-rabbit-hole',
    },
  },
}

export default function CompactWorkPage({ work }: { work: Work }) {
  const story = stories[work.slug]
  if (!story) return null

  return (
    <main>
      <TitleBlock meta={story.meta} title={story.title} intro={story.intro} />
      <HeroBackdrop image={imageFor(work, story.heroImage)} alt={story.heroAlt} gradient={story.gradient} />

      <SplitSection eyebrow="The Starting Point" stmt={story.startingPoint.stmt}>
        {story.startingPoint.paras.map((para) => (
          <p key={para.slice(0, 24)} className="body-copy">{para}</p>
        ))}
      </SplitSection>

      <JobGrid jobs={story.jobs} />

      {story.surfaces && (
        <SurfacesMosaic
          heading={story.surfaces.heading}
          items={story.surfaces.items.map((item) => ({ ...item, image: imageFor(work, item.image) }))}
        />
      )}

      {story.related ? (
        <section className="relative border-t border-border">
          <div className="inner-col grid gap-10 py-14 sm:grid-cols-2 sm:gap-0">
            <div className="flex flex-col gap-3 sm:pr-12">
              <p className="eyebrow">Results</p>
              <h2 className="stmt">{story.results.stmt}</h2>
              {story.results.paras.map((para) => (
                <p key={para.slice(0, 24)} className="body-copy">{para}</p>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:border-l sm:border-border sm:pl-12">
              <p className="eyebrow">From the Work</p>
              <h2 className="stmt">{story.related.stmt}</h2>
              <p className="body-copy">{story.related.copy}</p>
              <ReadLink to={story.related.to} label={story.related.label} />
            </div>
          </div>
        </section>
      ) : (
        <SplitSection eyebrow="Results" stmt={story.results.stmt}>
          {story.results.paras.map((para) => (
            <p key={para.slice(0, 24)} className="body-copy">{para}</p>
          ))}
        </SplitSection>
      )}

      <BackToHome />
    </main>
  )
}
