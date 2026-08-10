import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

function GmailIcon() {
  return (
    <svg viewBox="0 -31.5 256 256" preserveAspectRatio="xMidYMid" aria-hidden="true" className="h-5 w-5">
      <path d="M58.1818 192.0495V93.1404L27.5066 65.077 0 49.5041V174.595c0 9.6582 7.8255 17.4545 17.4545 17.4545h40.7273Z" className="fill-current transition-colors duration-200 group-hover:fill-[#4285F4]" />
      <path d="M197.8182 192.0495h40.7273c9.6582 0 17.4545-7.8255 17.4545-17.4545V49.5041l-31.1556 17.8382-27.0262 25.7981v98.9091Z" className="fill-current transition-colors duration-200 group-hover:fill-[#34A853]" />
      <path d="m58.1818 93.1404-4.174-38.6471 4.174-36.9892L128 69.8677l69.8182-52.3636 4.6693 34.992-4.6693 40.6443L128 145.5041 58.1818 93.1404Z" className="fill-current transition-colors duration-200 group-hover:fill-[#EA4335]" />
      <path d="M197.8182 17.5041v75.6363L256 49.5041V26.2313c0-21.5855-24.64-33.891-41.8909-20.9455l-16.2909 12.2183Z" className="fill-current transition-colors duration-200 group-hover:fill-[#FBBC04]" />
      <path d="M0 49.5041 26.7588 69.5732l31.423 23.5672V17.5041L41.8909 5.2859C24.6109-7.6596 0 4.6459 0 26.2313v23.2728Z" className="fill-current transition-colors duration-200 group-hover:fill-[#C5221F]" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M20 20h-4v-6.999c0-1.92-.847-2.991-2.366-2.991C11.981 10.01 11 11.126 11 13.001V20H7V7h4v1.462S12.255 6.26 15.083 6.26C17.912 6.26 20 7.986 20 11.558V20ZM2.442 4.921A2.442 2.442 0 1 1 2.442.04a2.442 2.442 0 0 1 0 4.881ZM0 20h5V7H0v13Z" />
    </svg>
  )
}

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const setRevealHeight = () => {
      document.documentElement.style.setProperty('--footer-reveal-height', `${footer.offsetHeight}px`)
    }

    setRevealHeight()
    const observer = new ResizeObserver(setRevealHeight)
    observer.observe(footer)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--footer-reveal-height')
    }
  }, [])

  return (
    <footer ref={footerRef} className="footer-reveal fixed inset-x-0 bottom-0 z-0 bg-foreground text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.55fr)] lg:items-end lg:gap-20">
          <h2 className="max-w-3xl font-heading text-feature font-bold tracking-[-0.07em]">Designing the systems behind decisions.</h2>
          <div className="flex flex-col items-start lg:justify-self-end lg:pb-1">
            <div className="flex items-center gap-3">
              <a
                href="mailto:amitka111@gmail.com"
                aria-label="Email Amit Kaplinsky"
                className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white hover:bg-white hover:text-foreground"
              >
                <GmailIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/amitkaplinsky/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Amit Kaplinsky on LinkedIn"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#0A66C2] hover:bg-[#0A66C2]"
              >
                <LinkedInIcon />
              </a>
              <Link to="/cv" className="footer-cv-cta inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-meta font-semibold text-white">
                <span>Download CV</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-caption uppercase tracking-[0.1em] text-white/40">
          <span>Amit Kaplinsky · Product Designer</span>
          <span>Tel Aviv · 2026</span>
        </div>
      </div>
    </footer>
  )
}
