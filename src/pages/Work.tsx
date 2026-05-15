import { Link } from 'react-router-dom'
import { projects } from '@/content/projects'
import { getCoverImage } from '@/lib/content'

export default function Work() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-14">
        {/* Intro */}
        <div className="px-5 sm:px-8 pt-16 sm:pt-24 pb-10 sm:pb-16">
          <p className="text-[22px] sm:text-[28px] md:text-[32px] leading-[1.2] tracking-[-0.03em] font-normal text-black max-w-2xl">
            <span className="font-bold">Amit Kaplinsky</span> is a Product Designer with 25 years of experience crafting enterprise software that people actually enjoy using.
          </p>
        </div>

        {/* Grid */}
        <div className="px-5 sm:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, i) => {
              const cover = getCoverImage(project.slug, project.coverIndex)
              return (
                <Link
                  key={`${project.slug}-${project.coverIndex}`}
                  to={`/experience/${project.slug}`}
                  className="group block animate-fade-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="overflow-hidden rounded-[6px] bg-black/[0.04] aspect-video">
                    {cover && (
                      <img
                        src={cover}
                        alt={project.company}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        loading={i === 0 ? 'eager' : 'lazy'}
                      />
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
