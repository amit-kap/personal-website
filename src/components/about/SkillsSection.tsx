import Reveal from '@/components/Reveal'
import { ClaudeMark, CodexMark, CursorMark, FigmaMark } from '@/components/BrandLogos'
import type { CVSkillGroup } from '@/lib/content'

/* The tools group shows brand marks instead of its cv.md list. Matched on the
   heading so small changes to the "Tools" label in cv.md do not break it.
   Rows are 32px to match the leading of the Languages column beside it. */
function isTools(category: string) {
  const label = category.trim().toLowerCase()
  return label.startsWith('tool') || label.startsWith('software')
}

const tools = [
  { Mark: FigmaMark, name: 'Figma' },
  { Mark: ClaudeMark, name: 'Claude Code' },
  { Mark: CodexMark, name: 'Codex' },
  { Mark: CursorMark, name: 'Cursor' },
]

export function SkillsSection({ skills }: { skills: CVSkillGroup[] }) {
  return (
    <section className="relative">
      <Reveal className="inner-col flex flex-col gap-6 pb-16 pt-12">
        <p className="eyebrow">Skills</p>
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-0">
          {skills.map((group, i) => (
            <div key={group.category} className={`flex flex-col gap-3 ${i > 0 ? 'sm:border-l sm:border-border sm:pl-8' : 'sm:pr-8'}`}>
              <h2 className="font-heading text-body font-medium">{group.category}</h2>
              {isTools(group.category) ? (
                <div className="flex flex-col text-body text-copy">
                  {tools.map(({ Mark, name }) => (
                    <span key={name} className="flex h-8 items-center gap-2.5">
                      <Mark size={20} />
                      {name}
                    </span>
                  ))}
                  <span className="flex h-8 items-center text-muted-foreground">More tools…</span>
                </div>
              ) : (
                <p className="text-body leading-8 text-copy">
                  {group.items.map((item) => (
                    <span key={item} className="block">{item}</span>
                  ))}
                </p>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
