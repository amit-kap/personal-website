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
    title: 'Turning CISO goals into owners, tasks, and measurable follow-through at Onyxia.',
    intro: 'At the time, Onyxia was developing a data platform for CISOs, connecting security products, BI, Jira, ServiceNow, and operational systems. I led product design during a six-month engagement, translating benchmarks and SLAs into workflows that connected executive priorities with owners, tasks, progress, and delays.',
    gradient: ['#0c1f4a', '#1d4ed8', '#60a5fa'],
    heroImage: '01-SSM-1',
    heroAlt: 'Onyxia security stack map',
    startingPoint: {
      stmt: 'A CISO needs more than another report',
      paras: [
        'Security leadership depends on data spread across security products, BI, Jira, ServiceNow, and operational systems. Onyxia brought that information into a shared model for the CISO and the teams responsible for execution.',
        'My role was to connect an executive decision to the work behind it: the benchmark, the expected result, the responsible owner, the active tasks, and anything holding progress back.',
      ],
    },
    jobs: [
      { title: 'Product design leadership', copy: 'Led product design during a focused engagement from April to October 2024.' },
      { title: 'Strategy into operations', copy: 'Connected benchmarks and SLAs to owners, tasks, progress, and delays.' },
      { title: 'One security data model', copy: 'Brought the security stack, BI, and operational systems into one working view.' },
    ],
    surfaces: {
      heading: 'From benchmarks to the tasks behind them',
      items: [
        {
          image: '05-p-hub',
          alt: 'Onyxia performance hub',
          eyebrow: 'The Follow-Through',
          title: 'The Performance Hub',
          copy: 'The current and expected score, followed by the active and suggested tasks that could close the gap. Each task has an owner and a deadline.',
        },
        {
          image: '03-frameworks',
          alt: 'Onyxia frameworks builder',
          eyebrow: 'The Benchmark',
          title: 'Weighted frameworks',
          copy: 'A measurable expression of executive priorities, using weighted categories and the CPIs behind them.',
        },
        {
          image: '02-SSM-2',
          alt: 'Onyxia security stack map budget view',
          eyebrow: 'The Stack',
          title: 'The security stack map',
          copy: 'Coverage and budget in one matrix: security functions against the assets they protect.',
        },
        {
          image: '04-insights',
          alt: 'Onyxia insights feed',
          eyebrow: 'The Signal',
          title: 'Insights, explained',
          copy: "A readable feed of the week's CPI movements: what improved, what declined, and why it matters.",
        },
      ],
    },
    results: {
      stmt: 'From executive benchmark to operational work',
      paras: ['In six months, I led the design of the core path from a CISO-level benchmark to the owners, tasks, progress, and delays behind it. The screens shown here represent that product direction.'],
    },
  },
  veriti: {
    meta: 'Security Controls  ·  Founding Designer  ·  2021–2024  ·  TLV',
    title: 'Turning a known exposure into an explained, approved security change at Veriti.',
    intro: 'As Founding Designer, I helped define a product for safe, multi-vendor remediation. The central problem was not finding another weakness. It was helping a security team understand the exact control change, its expected effect, and the risk before approving it.',
    gradient: ['#06302b', '#0f766e', '#2dd4bf'],
    heroImage: '02',
    heroAlt: 'Veriti security controls product',
    startingPoint: {
      stmt: 'Knowing about an exposure does not close it',
      paras: [
        'Security teams could identify exposures, but fixing them required knowing which control to change across a complex, multi-vendor stack. The product connected a known threat to the configuration gap that allowed it through.',
        'Before applying a change, Veriti explained what would change, in which product, why it mattered, and what effect the team should expect. A person remained accountable for approval.',
      ],
    },
    jobs: [
      { title: 'Product model and design system', copy: 'Built the product language and core interaction model during two and a half years of founding design.' },
      { title: 'Threat to control change', copy: 'Connected a known exposure to the exact configuration gap in the existing security stack.' },
      { title: 'Controlled remediation', copy: 'Made approval the accountability point before a change reached a production security control.' },
    ],
    surfaces: {
      heading: 'What changes, where, why',
      items: [
        {
          image: '04',
          alt: 'Veriti insights and remediation queue',
          eyebrow: 'The Core Flow',
          title: 'From found weakness to an approved fix',
          copy: "Each insight connects the exposure to its root cause and proposed control change. The product explains what changes, where, and why before requesting approval.",
        },
        {
          image: '05',
          alt: 'Veriti threat indicators table',
          eyebrow: 'The Data',
          title: 'Threat indicators at table scale',
          copy: (
            <>
              Tens of thousands of indicators made workable: the filtering pattern behind{' '}
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
          copy: 'A posture score supported by a map of assets, exposure, and business impact.',
        },
        {
          image: '06',
          alt: 'Veriti Am I Protected search',
          eyebrow: 'The Question',
          title: 'Am I protected?',
          copy: "The product's simplest surface: ask about any CVE and get an answer from your own stack.",
        },
      ],
    },
    results: {
      stmt: 'From product model to safe remediation',
      paras: ['Over two and a half years, the product moved from an initial model to a working remediation system. The surfaces shown here explain exposures, prioritize work, and carry a proposed control change through human approval.'],
    },
    related: {
      stmt: 'The filtering pattern, written up',
      copy: 'How we helped Veriti users wade through their data with a filtering pattern that scales.',
      label: 'Read: Sailing the Data Oceans',
      to: '/case-studies/sailing-the-data-oceans',
    },
  },
  semperis: {
    meta: 'Identity Security  ·  UX Team Lead  ·  2020–2021  ·  TLV',
    title: "Building the product language for Semperis's move from recovery to prevention.",
    intro: 'I led the UX transition as Semperis expanded from Active Directory recovery into continuous identity security. Alongside building the in-house design team, I defined how vulnerabilities, dangerous configurations, alerts, insights, severity, urgency, and required actions should appear across the product.',
    gradient: ['#37200a', '#b45309', '#fbbf24'],
    heroImage: '01-semperis',
    heroAlt: 'Semperis identity security platform',
    startingPoint: {
      stmt: 'From recovery to prevention',
      paras: [
        'Semperis had a mature product for recovering Active Directory after an attack. As the platform expanded into continuous prevention, it needed to help teams recognize and address dangerous configurations before recovery became necessary.',
        'That transition required a shared product vocabulary: what counts as a vulnerability, a dangerous configuration, an alert, or an insight, and how severity and urgency determine what needs attention.',
      ],
    },
    jobs: [
      { title: 'UX team leadership', copy: 'Built and led the in-house UX team while the platform expanded into identity security.' },
      { title: 'A language for risk', copy: 'Defined a shared vocabulary for vulnerabilities, configurations, alerts, and insights, organized by severity and urgency.' },
      { title: 'Recovery and prevention', copy: 'Led the UX and visual-system work connecting a defined recovery task with continuous security monitoring.' },
    ],
    results: {
      stmt: 'A product language and a team to carry it',
      paras: ['My time at Semperis produced two lasting foundations: a UX language for evolving identity risk and an in-house design team equipped to keep extending it.'],
    },
  },
  checkpoint: {
    meta: 'Enterprise Security  ·  UX Expert  ·  2014–2020  ·  TLV',
    title: 'Reworking twenty management tabs into one enterprise security system at Check Point.',
    intro: 'At Check Point I learned cybersecurity and enterprise product design inside an R&D organization of hundreds of developers. The redesign began with management spread across more than twenty tabs. We reorganized products, objects, policies, and daily security tasks around how administrators worked.',
    gradient: ['#380a1e', '#be185d', '#f472b6'],
    heroImage: '05-dashboard',
    heroAlt: 'Check Point security management dashboard',
    startingPoint: {
      stmt: 'Twenty tabs, hundreds of developers',
      paras: [
        'Enterprise security management had grown one tab at a time. More than twenty tabs reflected the structure of the product rather than the work administrators came to do.',
        'During six years as a UX Expert, I worked with a large R&D organization to translate product and technical requirements into information architecture, workflows, prototypes, and cross-platform behavior.',
      ],
    },
    jobs: [
      { title: 'Design inside a large R&D organization', copy: 'Alignment, technical constraints, ownership, and implementation were all part of the UX problem.' },
      { title: 'One information architecture', copy: 'Reorganized products, objects, policies, and daily security tasks around the administrator.' },
      { title: 'Requirements into behavior', copy: 'Turned complex product and technical requirements into flows, prototypes, and cross-platform experiences.' },
    ],
    surfaces: {
      heading: 'One system, not twenty tabs',
      items: [
        {
          image: '01-details',
          alt: 'Check Point action center activities',
          eyebrow: 'The Action Center',
          title: 'One activity stream for security operations',
          copy: 'Security, system, and configuration alerts in a single triaged stream: severity carries the eye, details one click down.',
        },
        {
          image: '06-mainPage',
          alt: 'Check Point Threat Cloud portal',
          eyebrow: 'Threat Cloud',
          title: 'The public face of the intelligence',
          copy: "Check Point's threat-intelligence portal: live attack counts, research, and security updates in one place.",
        },
        {
          image: '04-timeline',
          alt: 'Check Point event timeline',
          eyebrow: 'The Timeline',
          title: 'An event traced over time',
          copy: 'A high-CPU event plotted across months, with confirm, remind, and hand-off actions right on the row.',
        },
        {
          image: '02-mobile',
          alt: 'Check Point mobile device pairing',
          eyebrow: 'Desktop to Mobile',
          title: 'Pairing a mobile device',
          copy: 'The bridge from the management console to mobile: a QR pairing flow inside the Action Center.',
        },
      ],
    },
    results: {
      stmt: 'Enterprise design is also organizational design',
      paras: ['The redesign replaced product-shaped navigation with an information architecture organized around the administrator’s work. It also taught me how product decisions move through technical constraints, ownership boundaries, release cycles, and a large organization.'],
    },
    related: {
      stmt: 'A consumer app inside an enterprise company',
      copy: 'How a Check Point team adapted its product process to ship an SMB security app for iOS and Android.',
      label: 'Read: Falling Down the Rabbit Hole',
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
