import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'
import { Bento, Byline, CornerMark, StoryPreview, type Tile } from './WorkParts'
import { useViewer } from './useViewer'

/* The bento: the mobile app motion study as the large tile with the Check Point design tile beside it, then
   screenshots and motion studies, and last the console screens (Action Center large, Timeline and Threat Cloud beside it). */
const TILES: Tile[] = [
  { video: 'checkpoint/mtp.mp4', poster: 'checkpoint/mtp.jpg', alt: 'Mobile threat prevention app, motion study', size: 'lg' },
  { brand: 'checkpoint', color: '#ED0A5D', alt: 'Check Point logo' },
  { file: '02-mobile.jpg', alt: 'Pairing a mobile device', x: 52.8, y: 40.6, z: 2.4 },
  { file: '03-summary.webp', alt: 'Incident summary with actions', x: 60.2, y: 36.7, z: 3.1 },
  { video: 'checkpoint/za.mp4', x: 50, y: 50, z: 1, poster: 'checkpoint/za.jpg', alt: 'Mobile security app, motion study' },
  { video: 'checkpoint/endpoint.mp4', x: 50.5, y: 40.7, z: 1, poster: 'checkpoint/endpoint.jpg', alt: 'Endpoint security, motion study' },
  { video: 'checkpoint/monitor.mp4', x: 82, y: 32.9, z: 1, poster: 'checkpoint/monitor.jpg', alt: 'Monitoring view wireframes', size: 'wide' },
  { file: '05-dashboard.webp', alt: 'Overview: the campaign alert', x: 76.9, y: 26.9, z: 2, size: 'wide' },
  { file: '04-timeline.webp', alt: 'Timeline: an event traced over months', x: 14.2, y: 14.1, z: 4.9 },
  { file: '01-details.webp', alt: 'Action Center: alerts in one triaged stream', x: 0, y: 0, z: 1, size: 'lg' },
  { file: '06-mainPage.webp', alt: 'Threat Cloud: live attack counts and research', x: 38.6, y: 8.8, z: 4.1 },
]

/* The Check Point work page: same centered column and type as the Shift and Veriti pages. */
export default function CheckPointPage() {
  const work = getWorkBySlug('checkpoint')
  const viewer = useViewer()
  const base = import.meta.env.BASE_URL

  return (
    <div className="h01 h01-center h01-case h01-work">
      <main className="h01-col">
        <CornerMark />

        <h1 className="h01-title">{work?.productTitle}</h1>
        <Byline company="Check Point" role="UX Expert" years="2014-2020" />

        <p className="h01-text h01-intro">
          At Check Point I learned cybersecurity and enterprise product design inside an R&amp;D organization of hundreds of
          developers. I joined the combined effort to redesign security management, from a cluster of more than twenty tabs
          into a modern platform built around how administrators actually work. I also led WatchTower, our mobile app, from concept to
          its 2019 iOS and Android launch.
        </p>

        <Bento
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
