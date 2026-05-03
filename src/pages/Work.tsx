import { Link } from 'react-router-dom'
import { getAllWorks } from '@/lib/content'

export default function Work() {
  const works = getAllWorks()

  return (
    <section className="px-8 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black">
        {works.map((work) => (
          <Link
            key={work.slug}
            to={`/work/${work.slug}`}
            className="group bg-white block p-6 hover:bg-black hover:text-white transition-colors"
          >
            {work.thumbnail && (
              <div className="aspect-[4/3] overflow-hidden mb-4 bg-black/5">
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{work.title}</span>
              <span className="text-xs opacity-50">{work.year}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
