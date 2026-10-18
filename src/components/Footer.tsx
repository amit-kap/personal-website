/* Site footer: the orange call-to-action band with contact links, credits and
   a Tel Aviv clock. */
import { Link, useLocation } from 'react-router-dom'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import { footerNav, isActive } from '@/components/siteNav'
import { CV_PDF_NAME, CV_PDF_URL } from '@/lib/cvPdf'
import { useTelAvivClock } from '@/lib/useTelAvivClock'

const LINKEDIN_URL = 'https://www.linkedin.com/in/amitkaplinsky'

/* Dark (panel) reveal buttons on the orange band: Glaze's RevealButton as a
   link, a 52px circle at rest (20px icon + 15px padding + 1px border) that
   opens to show its label on hover or keyboard focus. */
const bandRevealButton =
  'h-[52px] min-w-[52px] rounded-pill bg-card px-[15px] text-body font-medium text-foreground hover:bg-card hover:px-5 focus-visible:px-5 transition-[padding,background-color,transform] duration-(--duration-moderate) ease-standard active:scale-[0.97] motion-reduce:transition-none'

function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5 shrink-0">
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 22 22" width="22" height="22" aria-hidden="true" className="size-5 shrink-0">
      <g fillRule="evenodd">
        <path
          className="fill-card"
          d="M2.445 22L19.556 22C20.905 22 22 20.906 22 19.556L22 2.445C22 1.095 20.905 0 19.556 0L2.445 0C1.094 0 0 1.095 0 2.445L0 19.556C0 20.906 1.094 22 2.445 22Z"
        />
        <path
          className="fill-foreground"
          d="M18.945 18.945L15.68 18.945 15.68 13.384C15.68 11.86 15.101 11.007 13.894 11.007 12.581 11.007 11.895 11.895 11.895 13.384L11.895 18.945 8.749 18.945 8.749 8.352 11.895 8.352 11.895 9.779C11.895 9.779 12.842 8.028 15.09 8.028 17.336 8.028 18.945 9.4 18.945 12.238L18.945 18.945ZM4.996 6.965C3.924 6.965 3.056 6.09 3.056 5.01 3.056 3.931 3.924 3.056 4.996 3.056 6.067 3.056 6.935 3.931 6.935 5.01 6.935 6.09 6.067 6.965 4.996 6.965ZM3.371 18.945L6.651 18.945 6.651 8.352 3.371 8.352 3.371 18.945Z"
        />
      </g>
    </svg>
  )
}

/* Lucide "heart" at the caption size, labelled so the credit reads "I love Claude". */
function HeartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="love" className="size-3 shrink-0">
      <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
    </svg>
  )
}

function CvIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5 shrink-0">
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M16 22a4 4 0 0 0-8 0" />
      <circle cx="12" cy="15" r="3" />
    </svg>
  )
}

export default function Footer() {
  const clock = useTelAvivClock()
  // On Work with me the package circle hangs 56px into the band, so the
  // heading starts lower to keep 64px clear below it. That page keeps the
  // founder pitch.
  const { pathname } = useLocation()
  const workWithMe = pathname === '/work-with-me'

  /* As in Paper: one orange band, from the CTA down to the credits and clock. */
  return (
    <footer className="text-primary-foreground">
      <div className={`flex flex-col items-center gap-10 bg-primary/90 px-4 ${workWithMe ? 'pt-30' : 'pt-20'}`}>
        <h2 className="whitespace-pre-line text-center text-feature font-medium text-primary-foreground">
          {workWithMe ? "Building a new product?\nLet's see if it's a fit." : 'Bring me the\ncomplicated one.'}
        </h2>
        <p className="w-full max-w-[586px] text-center text-body leading-5 text-secondary-foreground">
          {workWithMe
            ? 'For founders of complex B2B, AI and dev-tool products who need senior product judgment without a full-time hire.'
            : 'Email, LinkedIn or my CV below.'}
        </p>
        {/* RevealButton is a Base UI <button> that renders these anchors
            (nativeButton={false}); role="link" keeps them announced as links.
            The data-umami-* attributes are the analytics event names. */}
        <div className="flex items-center gap-10">
          <RevealButton
            render={<a href="mailto:amitka111@gmail.com" data-umami-event="contact-email" data-umami-event-location="footer" />}
            nativeButton={false}
            role="link"
            label="Let's talk"
            className={bandRevealButton}
          >
            <SendIcon />
          </RevealButton>
          <RevealButton
            render={<a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" data-umami-event="contact-linkedin" />}
            nativeButton={false}
            role="link"
            label="View profile"
            className={bandRevealButton}
          >
            <LinkedInIcon />
          </RevealButton>
          <RevealButton
            render={<a href={CV_PDF_URL} download={CV_PDF_NAME} data-umami-event="download-cv" />}
            nativeButton={false}
            role="link"
            label="Download CV"
            className={bandRevealButton}
          >
            <CvIcon />
          </RevealButton>
        </div>
        {/* One row on the 800px column, like the header: every page on the
            left, the credit centred and the
            clock on the right; stacked and centred on phones. */}
        <div className="flex w-full max-w-[800px] flex-col items-center gap-3 py-5 text-caption text-primary-foreground/70 sm:grid sm:grid-cols-3">
          {/* Dot-separated like the header; every item stays dim, the current
              one only underlined, and hover lifts an item to white. */}
          <nav aria-label="Footer navigation" className="flex gap-1 font-medium sm:justify-self-start">
            {footerNav.map((item, i) => (
              <span key={item.to} className="flex gap-1">
                {i > 0 && (
                  <span aria-hidden="true" className="whitespace-pre">
                    {' ·'}
                  </span>
                )}
                <Link
                  to={item.to}
                  aria-current={isActive(item.to, pathname) ? 'page' : undefined}
                  className="underline-offset-4 transition-colors hover:text-primary-foreground aria-[current=page]:underline"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
          <p className="flex items-center gap-1 sm:justify-self-center">
            I <HeartIcon /> Claude
          </p>
          <p suppressHydrationWarning className="tabular-nums sm:justify-self-end">{clock}</p>
        </div>
      </div>
    </footer>
  )
}
