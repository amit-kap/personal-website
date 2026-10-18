import { useParams } from 'react-router-dom'
import { getWorkBySlug } from '@/lib/content'
import Seo from '@/components/Seo'
import CompactWorkPage from '@/components/work/CompactWorkPage'
import ShiftWorkPage from '@/components/work/ShiftWorkPage'
import NotFound from '@/pages/NotFound'

export default function WorkItem() {
  const { slug } = useParams<{ slug: string }>()
  const work = slug ? getWorkBySlug(slug) : undefined

  // An unknown slug gets the site's 404 page (its own title and main landmark).
  if (!work) return <NotFound />

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
