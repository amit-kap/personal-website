import { useParams, Link } from 'react-router-dom'
import { getWorkDetail } from '@/lib/content'

export default function WorkItem() {
  const { slug } = useParams<{ slug: string }>()
  const work = getWorkDetail(slug ?? '')

  if (!work) {
    return (
      <div className="px-8 py-16 max-w-2xl mx-auto">
        <p className="text-sm opacity-50">Work item not found.</p>
        <Link to="/work" className="text-sm underline mt-4 inline-block">← Back to Work</Link>
      </div>
    )
  }

  return (
    <article className="px-8 py-16 max-w-4xl mx-auto">
      <Link to="/work" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
        ← Work
      </Link>

      <header className="mt-8 mb-12">
        <h1 className="text-4xl font-light tracking-tight mb-2">{work.title}</h1>
        <div className="flex gap-6 text-sm opacity-50">
          <span>{work.year}</span>
        </div>
        {work.description && (
          <p className="mt-4 text-sm leading-relaxed max-w-xl">{work.description}</p>
        )}
      </header>

      <div className="flex flex-col gap-2">
        {work.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${work.title} — image ${i + 1}`}
            className="w-full block"
          />
        ))}
      </div>
    </article>
  )
}
