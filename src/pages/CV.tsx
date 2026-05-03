import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import cvContent from '../content/cv.md?raw'
import FreeCodeCampIcon from '@/components/FreeCodeCampIcon'

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    const el = node as { props: { children?: React.ReactNode } }
    return extractText(el.props.children)
  }
  return ''
}

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <div className="flex items-center gap-5 sm:gap-6 mb-6">
      <img
        src={`${import.meta.env.BASE_URL}profile.jpg`}
        alt="Profile"
        className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] shrink-0 object-cover bg-black/[0.06] rounded-full"
      />
      <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-normal italic leading-none tracking-tight">
        {children}
      </h1>
    </div>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] mt-12 sm:mt-16 mb-5 pb-3 border-b border-black/20 text-black/60">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[15px] font-medium mb-0.5">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[14px] leading-7 mb-4 text-black/60">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-6 space-y-1">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => {
    const isFCC = extractText(children).includes('freeCodeCamp')
    return (
      <li className="text-[14px] leading-7 text-black/60 flex items-center gap-2">
        {isFCC && <FreeCodeCampIcon className="w-6 h-6 shrink-0" />}
        {children}
      </li>
    )
  },
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-black/80">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => {
    if (href?.startsWith('/')) {
      return (
        <Link
          to={href}
          className="after:content-['_→'] after:text-black/30 after:ml-0.5 hover:text-black/50 transition-colors duration-200"
        >
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black/50 transition-colors">
        {children}
      </a>
    )
  },
}

export default function CV() {
  return (
    <article className="max-w-2xl mx-auto px-6 sm:px-8 pt-14 sm:pt-20 md:pt-24 pb-16 sm:pb-24 animate-fade-up">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {cvContent}
      </ReactMarkdown>
    </article>
  )
}
