import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'
import { Bento, Byline, CornerMark, StoryPreview, useViewer, WorkTabs, type Tab, type Tile } from './WorkParts'

/* Veriti has no live product, so the tabs switch full screenshots instead. Each tab names a screen and the decision
   behind it. */
const TABS: (Tab & { file: string })[] = [
  { name: 'Insights', file: '04.webp', desc: 'Each insight connects an exposure to its root cause and the control change that fixes it, explained before anyone approves it.' },
  { name: 'Indicators', file: '05.webp', desc: 'Tens of thousands of threat indicators, made workable with filters any analyst can compose.' },
  { name: 'Posture', file: '03.webp', desc: 'One score, backed by a map of assets, exposure and business impact.' },
  { name: 'Am I protected?', file: '06.webp', desc: 'Ask about any CVE and get an answer from your own stack.' },
]

/* The bento: the dashboard as the large tile, then login and settings, each zoomed into one detail. */
const TILES: Tile[] = [
  { file: '02.webp', alt: 'Dashboard', x: 11, y: 4, z: 1.8 },
  { file: '01.webp', alt: 'Login', x: 0, y: 22, z: 1.5 },
  { file: '07.webp', alt: 'Settings', x: 50, y: 40, z: 2.2 },
]

/* The Veriti work page: same centered column and type as the Shift page. */
export default function VeritiPage() {
  const work = getWorkBySlug('veriti')
  const [tab, setTab] = useState(TABS[0].name)
  const viewer = useViewer()
  const current = TABS.find((t) => t.name === tab) ?? TABS[0]
  const image = work?.bodyImages[current.file]

  return (
    <div className="h01 h01-center h01-case h01-work">
      <main className="h01-col">
        <CornerMark />

        <h1 className="h01-title">{work?.productTitle}</h1>
        <Byline company="Veriti" role="Founding Designer" years="2021-2024" />

        <p className="h01-text h01-intro">
          I joined Veriti as its founding designer and spent two and a half years building the product and its design
          system. Security teams already knew about their exposures. The hard part was fixing them safely across many
          vendors' controls. Veriti traced each exposure to the configuration gap that let it through, then explained the
          proposed change and its effect before anyone approved it.
        </p>

        <button type="button" className="h01-enlarge" onClick={() => image && viewer.show({ src: image.src, alt: `Veriti ${current.name}` })}>
          <Maximize2 size={16} strokeWidth={1.5} aria-hidden /> Enlarge
        </button>
        <div className="h01-app" role="group" aria-label={`Veriti ${current.name}`}>
          {image && <img src={image.src} width={image.width} height={image.height} alt={`Veriti ${current.name} screen`} />}
        </div>

        <WorkTabs tabs={TABS} active={tab} onPick={setTab} label="Veriti screens" />

        <Bento tiles={TILES} images={work?.bodyImages ?? {}} onOpen={viewer.show} />
        {viewer.dialog}

        <StoryPreview slug="sailing-the-data-oceans" />

        <SiteFooter />
      </main>
    </div>
  )
}
