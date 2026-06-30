import { Link } from 'react-router-dom'

type NavItem = { to: string; label: string }

/**
 * Bottom-of-page pager shared by the work and case-study pages:
 *
 *   [← Previous]        ( Home )        [Next →]
 *
 * The centered Home pill always renders, so home stays reachable even on a page
 * with no prev/next neighbour. Each caller maps its own data to { to, label }.
 */
export default function PrevNextNav({ prev, next }: { prev?: NavItem; next?: NavItem }) {
  return (
    <nav className="mt-20 pt-10 border-t border-foreground/10 flex justify-between items-end gap-6">
      {/* Previous (left) */}
      <div className="flex-1 min-w-0">
        {prev && (
          <Link to={prev.to} className="group inline-flex flex-col items-start gap-1.5">
            <span className="text-caption font-mono uppercase tracking-[0.2em] text-foreground/35">← Previous</span>
            <span className="text-meta font-medium text-foreground/70 group-hover:text-foreground transition-colors leading-snug">
              {prev.label}
            </span>
          </Link>
        )}
      </div>

      {/* Home (center) */}
      <Link
        to="/"
        className="shrink-0 inline-flex items-center px-4 py-2 border border-foreground/15 rounded-full text-caption font-mono uppercase tracking-[0.2em] text-foreground/55 hover:bg-foreground/[0.04] hover:text-foreground transition-colors"
      >
        Home
      </Link>

      {/* Next (right) */}
      <div className="flex-1 min-w-0 flex justify-end">
        {next && (
          <Link to={next.to} className="group inline-flex flex-col items-end gap-1.5 text-right">
            <span className="text-caption font-mono uppercase tracking-[0.2em] text-foreground/35">Next →</span>
            <span className="text-meta font-medium text-foreground/70 group-hover:text-foreground transition-colors leading-snug">
              {next.label}
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}
