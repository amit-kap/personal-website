import { Link } from 'react-router-dom'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import { accentRevealButton } from '@/components/actionButtons'
import { ReadIcon, RevealArrow } from '@/components/icons'

/* Related-writing link: an orange reveal button with a read icon. */
function ReadLink({ to, label, className = 'self-start' }: { to: string; label: string; className?: string }) {
  return (
    <RevealButton render={<Link to={to} />} nativeButton={false} role="link" label={label} iconSide="end" className={`${accentRevealButton} ${className}`}>
      <ReadIcon />
    </RevealButton>
  )
}

/* The page's closing actions, in a centred row 40px apart like the footer's:
   back to the home page, then (optionally) the related writing.
   RevealButton is a Base UI <button> rendering a <Link>, so it carries
   role="link" to be announced as the navigation it is. */
export function ClosingActions({ read }: { read?: { to: string; label: string } }) {
  return (
    <section className="relative">
      <div className="inner-col flex items-center justify-center gap-10 pb-18 pt-16">
        <RevealButton render={<Link to="/" />} nativeButton={false} role="link" label="Back to home" className={accentRevealButton}>
          <RevealArrow back />
        </RevealButton>
        {read && <ReadLink to={read.to} label={read.label} className="" />}
      </div>
    </section>
  )
}
