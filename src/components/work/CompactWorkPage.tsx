import type { Work } from '@/lib/content'
import { ClosingActions } from '@/components/work/ClosingActions'
import { HeroMedia } from '@/components/work/HeroMedia'
import { FeatureSection } from '@/components/work/FeatureSection'
import { JobList } from '@/components/work/JobList'
import { SplitSection } from '@/components/work/SplitSection'
import { TitleBlock } from '@/components/work/TitleBlock'
import { WindowCard } from '@/components/work/WindowCard'
import { compactStories } from '@/components/work/compactStories'
import { imageFor } from '@/lib/workImages'

/* The shorter work-page template used by every work except Shift, which has
   its own page (ShiftWorkPage). Same stacked layout as Shift. Copy and image keys come from compactStories. */
export default function CompactWorkPage({ work }: { work: Work }) {
  const story = compactStories[work.slug]
  if (!story) return null

  return (
    <main>
      <TitleBlock meta={story.meta} title={story.title} intro={story.intro} />
      <HeroMedia image={imageFor(work, story.heroImage)} alt={story.heroAlt} />

      <SplitSection eyebrow="The Starting Point" stmt={story.startingPoint.stmt}>
        {story.startingPoint.paras.map((para) => (
          <p key={para.slice(0, 24)} className="body-copy">{para}</p>
        ))}
      </SplitSection>

      <JobList stmt={story.jobsStmt} jobs={story.jobs} />

      {story.surfaces?.map((item) => (
        <FeatureSection key={item.title} eyebrow={item.eyebrow} title={item.title} copy={item.copy}>
          <WindowCard image={imageFor(work, item.image)} alt={item.alt} caption={item.label} />
        </FeatureSection>
      ))}

      <SplitSection eyebrow="Results" stmt={story.results.stmt}>
        {story.results.paras.map((para) => (
          <p key={para.slice(0, 24)} className="body-copy">{para}</p>
        ))}
      </SplitSection>

      {story.related?.stmt && story.related.copy && (
        <SplitSection eyebrow="From the Work" stmt={story.related.stmt}>
          <p className="body-copy">{story.related.copy}</p>
        </SplitSection>
      )}

      <ClosingActions read={story.related && { to: story.related.to, label: story.related.label }} />
    </main>
  )
}
