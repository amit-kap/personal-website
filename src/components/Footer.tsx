export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`bg-black text-white ${className}`}>
      <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pt-10 pb-5 sm:pt-12 sm:pb-6">
        {/* Dateline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-7 gap-x-8 md:gap-x-12 pb-8 sm:pb-10 border-b border-white/10">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35 mb-2.5">
              Location
            </p>
            <p className="text-[14px] text-white leading-snug">Tel Aviv · GMT+3</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35 mb-2.5">
              Currently
            </p>
            <p className="text-[14px] text-white leading-snug">Design Lead at Shift</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35 mb-2.5">
              Focus
            </p>
            <p className="text-[14px] text-white leading-snug">AI products, 0→1</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/35 mb-2.5">
              Reach
            </p>
            <a
              href="mailto:amitka111@gmail.com"
              className="text-[14px] text-white hover:text-white/60 transition-colors leading-snug inline-flex items-baseline gap-1"
            >
              amitka111@gmail.com
              <span className="text-white/40 text-[11px]">↗</span>
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-5 sm:pt-6">
          <span className="text-[10px] text-white/25 uppercase tracking-[0.2em]">
            © 2026 Amit Kaplinsky
          </span>
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
    </footer>
  )
}
