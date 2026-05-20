import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllExperienceImages } from '@/lib/content'

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function slugLabel(slug: string): string {
  return slug.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' ')
}

export default function Work() {
  const [picks, setPicks] = useState(() => shuffled(getAllExperienceImages()).slice(0, 8))
  const [shuffleKey, setShuffleKey] = useState(0)

  const handleShuffle = () => {
    setPicks(shuffled(getAllExperienceImages()).slice(0, 8))
    setShuffleKey(k => k + 1)
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-14 w-full 2xl:mx-auto 2xl:max-w-[1440px]">
        {/* Intro */}
        <div className="px-5 sm:px-8 pt-16 sm:pt-24 pb-10 sm:pb-16">
          <p className="text-[22px] sm:text-[28px] md:text-[32px] leading-[1.2] tracking-[-0.03em] font-normal text-black max-w-2xl animate-fade-up">
            <span className="font-bold">Product designer. AI builder.</span> A decade of turning messy ideas into clean, shipped products. The 0→1 chaos is where I live.
          </p>
        </div>

        {/* Grid */}
        <div className="px-5 sm:px-8 pb-24">
          <button
            onClick={handleShuffle}
            className="block mb-3 text-[10px] font-mono uppercase tracking-[0.25em] text-black/40 hover:text-black transition-colors duration-200 cursor-pointer animate-fade-up"
            aria-label="Shuffle work tiles"
          >
            Shuffle
          </button>
          <div key={shuffleKey} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {picks.map((pick, i) => (
              <Link
                key={pick.src}
                to={`/experience/${pick.slug}`}
                className="group block animate-fade-up"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="overflow-hidden rounded-[6px] bg-black/[0.04] aspect-video border border-black/[0.05]">
                  <img
                    src={pick.src}
                    alt={slugLabel(pick.slug)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
