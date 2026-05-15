export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`bg-black text-white overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 sm:px-8 pt-7 pb-3">
        <span className="text-[10px] text-white/25 uppercase tracking-[0.2em]">
          © 2026 Amit Kaplinsky
        </span>
        <div className="flex gap-5">
          <a
            href="mailto:amitka111@gmail.com"
            className="text-[10px] text-white/25 hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            Email ↗
          </a>
          <a
            href="https://www.linkedin.com/in/amitka/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-white/25 hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
      <div className="leading-none">
        <svg
          viewBox="0 0 1000 140"
          preserveAspectRatio="xMidYMid meet"
          className="w-full block"
          aria-hidden="true"
        >
          <text
            x="0"
            y="120"
            textLength="1000"
            lengthAdjust="spacingAndGlyphs"
            className="fill-white"
            style={{ fontSize: '140px', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'inherit' }}
          >
            Amit Kaplinsky
          </text>
        </svg>
      </div>
    </footer>
  )
}
