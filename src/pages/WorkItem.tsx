import { useParams } from 'react-router-dom'
import { getWorkBySlug } from '@/lib/content'
import Seo from '@/components/Seo'
import CompactWorkPage from '@/components/work/CompactWorkPage'
import ShiftWorkPage from '@/components/work/ShiftWorkPage'

export default function WorkItem() {
  const { slug } = useParams<{ slug: string }>()
  const work = slug ? getWorkBySlug(slug) : undefined

  if (!work) {
    return (
      <div className="relative z-10 min-h-screen bg-background">
        <div className="mx-auto max-w-xl px-5 pb-24 pt-24 sm:px-8">
          <p className="text-meta text-foreground/40">Work not found.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Seo
        title={`${work.company} | ${work.role}`}
        description={work.blurb}
        path={`/work/${work.slug}`}
        type="article"
      />
      {work.slug === 'shift' ? <ShiftWorkPage work={work} /> : <CompactWorkPage work={work} />}
    </>
  )
}
