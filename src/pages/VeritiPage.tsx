import './home01.css'
import SiteFooter from './SiteFooter'
import { getWorkBySlug } from '@/lib/content'
import { Bento, Byline, CornerMark, StoryPreview, type Tile } from './WorkParts'
import { useViewer } from './useViewer'

/* The bento: the dashboard as the large tile with the Veriti design tile and settings beside it, then the main screens
   (Insights, Indicators wide; Login, Posture, Am I protected? small). Login sits away from the purple design tile. Each zooms into one detail; clicking opens the whole screen. */
const TILES: Tile[] = [
  { file: '02.webp', alt: 'Dashboard', x: 8.8, y: 14.3, z: 1.9, size: 'lg' },
  { brand: 'veriti', color: '#2A085C', alt: 'Veriti logo', original: true },
  { file: '07.webp', alt: 'Settings', x: 45.9, y: 17.5, z: 4.6 },
  { file: '04.webp', alt: 'Insights: an exposure traced to the control change that fixes it', x: 59.8, y: 20.2, z: 2.5, size: 'wide' },
  { file: '05.webp', alt: 'Indicators: threat indicators with composable filters', x: 9.3, y: 19.4, z: 2.3, size: 'wide' },
  { file: '01.webp', alt: 'Login', x: 3.9, y: 8.5, z: 2.1 },
  { file: '03.webp', alt: 'Posture: one score backed by assets, exposure and impact', x: 31.5, y: 50.1, z: 1 },
  { file: '06.webp', alt: 'Am I protected? Ask about any CVE', x: 54.9, y: 17.8, z: 2 },
]

/* The Veriti work page: same centered column and type as the Shift page. */
export default function VeritiPage() {
  const work = getWorkBySlug('veriti')
  const viewer = useViewer()

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

        <Bento tiles={TILES} images={work?.bodyImages ?? {}} onOpen={viewer.show} />
        {viewer.dialog}

        <StoryPreview slug="sailing-the-data-oceans" />

        <SiteFooter />
      </main>
    </div>
  )
}
