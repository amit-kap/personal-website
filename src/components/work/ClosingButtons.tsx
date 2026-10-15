import { Link } from 'react-router-dom'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import { revealPill } from '@/components/pillButton'
import { ReadIcon, RevealArrow } from '@/components/icons'

/* Related-writing link: an orange reveal button with a read icon. */
function ReadLink({ to, label, className = 'self-start' }: { to: string; label: string; className?: string }) {
  return (
    <RevealButton render={<Link to={to} />} nativeButton={false} role="link" label={label} iconSide="end" className={`${revealPill} ${className}`}>
      <ReadIcon />
    </RevealButton>
  )
}

/* The page's closing buttons, in a centred row 40px apart like the footer's:
   back to the home page, then (optionally) the related writing. */
export function BackToHome({ read }: { read?: { to: string; label: string } }) {
  return (
    <section className="relative">
      <div className="inner-col flex items-center justify-center gap-10 pb-18 pt-16">
        <RevealButton render={<Link to="/" />} nativeButton={false} role="link" label="Back to home" className={revealPill}>
          <RevealArrow back />
        </RevealButton>
        {read && <ReadLink to={read.to} label={read.label} className="" />}
      </div>
    </section>
  )
}
