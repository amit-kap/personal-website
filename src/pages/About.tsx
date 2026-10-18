import { getCV } from '@/lib/content'
import Parallax from '@/components/Parallax'
import Reveal from '@/components/Reveal'
import Seo from '@/components/Seo'
import { CvMetaSection } from '@/components/about/CvSection'
import { ExperienceSection } from '@/components/about/ExperienceSection'
import { SkillsSection } from '@/components/about/SkillsSection'

export default function About() {
  const cv = getCV()

  return (
    <main>
      <Seo
        title="About"
        description="Product designer with more than a decade of cybersecurity products, making complex products clear and trustworthy in any domain."
        path="/about"
      />
      {/* Portrait hero; the photo dissolves into the page through a mask fade. */}
      <section className="relative overflow-hidden">
        {/* Centered with auto margins, not a transform, so the drift owns it. */}
        <Parallax ratio={0.4} className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-[min(500px,64vw)]">
          <Reveal scale>
            <img
              src={`${import.meta.env.BASE_URL}portrait-hero.png`}
              alt="Amit Kaplinsky"
              width={847}
              height={1270}
              className="block w-full"
              style={{
                WebkitMaskImage: 'linear-gradient(180deg, #000 30%, rgba(0,0,0,0.3) 48%, transparent 62%)',
                maskImage: 'linear-gradient(180deg, #000 30%, rgba(0,0,0,0.3) 48%, transparent 62%)',
              }}
            />
          </Reveal>
        </Parallax>
        <div className="inner-col relative grid items-end gap-10 pb-16 pt-[clamp(260px,29vw,420px)]">
          {/* Centred under the portrait and set like the home hero: the
              headline on two balanced lines, then the intro in the home
              hero's supporting style. */}
          <div className="flex flex-col items-center gap-6 text-center">
            <Reveal as="h1" className="max-w-[640px] text-balance font-heading text-feature font-medium" delay={0.22}>
              I like figuring things out and seeing where they can go.
            </Reveal>
            <Reveal as="p" className="w-full max-w-[568px] text-balance text-stmt text-muted-foreground" delay={0.3}>
              {cv.header.intro}
            </Reveal>
          </div>
        </div>
      </section>
      <ExperienceSection experience={cv.experience} />
      <CvMetaSection title="Certificates" entries={cv.certificates} />
      <CvMetaSection title="Education" entries={cv.education} />
      <SkillsSection skills={cv.skills} />
    </main>
  )
}
