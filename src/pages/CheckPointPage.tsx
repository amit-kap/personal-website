import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'
import { Bento, Byline, CornerMark, StoryPreview, VideoTile, WorkTabs, type Tab, type Tile } from './WorkParts'
import { useViewer } from './useViewer'

/* The tabs switch full screenshots of the management console. Each names a screen and the decision behind it. */
const TABS: (Tab & { file: string })[] = [
  { name: 'Action Center', file: '01-details.webp', desc: 'Security, system and configuration alerts in one triaged stream. Severity leads, details one click down.' },
  { name: 'Timeline', file: '04-timeline.webp', desc: 'An event traced over months, with confirm, remind and hand-off right on the row.' },
  { name: 'Overview', file: '05-dashboard.webp', desc: 'Every site and gateway in one view, with the attack in progress up front.' },
  { name: 'Threat Cloud', file: '06-mainPage.webp', desc: "Check Point's threat intelligence portal: live attack counts, research and security updates." },
]

/* The bento: the mobile app motion study as the large tile, then screenshots and the other motion studies. */
const TILES: Tile[] = [
  { file: '02-mobile.jpg', alt: 'Pairing a mobile device', x: 50, y: 40, z: 2.6 },
  { file: '03-summary.webp', alt: 'Incident summary with actions', x: 30, y: 25, z: 2.4 },
  { video: 'checkpoint/za.mp4', poster: 'checkpoint/za.jpg', alt: 'Mobile security app, motion study' },
  { video: 'checkpoint/endpoint.mp4', poster: 'checkpoint/endpoint.jpg', alt: 'Endpoint security, motion study' },
  { video: 'checkpoint/monitor.mp4', poster: 'checkpoint/monitor.jpg', alt: 'Monitoring view wireframes' },
  { file: '05-dashboard.webp', alt: 'Overview: the campaign alert', x: 48, y: 30, z: 2.2 },
]

/* The Check Point work page: same centered column and type as the Shift and Veriti pages. */
export default function CheckPointPage() {
  const work = getWorkBySlug('checkpoint')
  const [tab, setTab] = useState(TABS[0].name)
  const viewer = useViewer()
  const current = TABS.find((t) => t.name === tab) ?? TABS[0]
  const image = work?.bodyImages[current.file]
  const base = import.meta.env.BASE_URL

  return (
    <div className="h01 h01-center h01-case h01-work">
      <main className="h01-col">
        <CornerMark />

        <h1 className="h01-title">{work?.productTitle}</h1>
        <Byline company="Check Point" role="UX Expert" years="2014-2020" />

        <p className="h01-text h01-intro">
          At Check Point I learned cybersecurity and enterprise product design inside an R&amp;D organization of hundreds of
          developers. Security management had grown to more than twenty tabs, so we reorganized products, objects, policies
          and daily tasks around how administrators actually work. I also led WatchTower, our mobile app, from concept to
          its 2019 iOS and Android launch.
        </p>

        <button type="button" className="h01-enlarge" onClick={() => image && viewer.show({ src: image.src, alt: `Check Point ${current.name}` })}>
          <Maximize2 size={16} strokeWidth={1.5} aria-hidden /> Enlarge
        </button>
        <div className="h01-app" role="group" aria-label={`Check Point ${current.name}`}>
          {image && <img src={image.src} width={image.width} height={image.height} alt={`Check Point ${current.name} screen`} />}
        </div>

        <WorkTabs tabs={TABS} active={tab} onPick={setTab} label="Check Point screens" />

        <Bento
          lead={<VideoTile src={`${base}checkpoint/mtp.mp4`} poster={`${base}checkpoint/mtp.jpg`} alt="Mobile threat prevention app, motion study" onOpen={viewer.show} />}
          tiles={TILES}
          images={work?.bodyImages ?? {}}
          onOpen={viewer.show}
        />
        {viewer.dialog}

        <StoryPreview slug="falling-down-the-rabbit-hole" />

        <SiteFooter />
      </main>
    </div>
  )
}
