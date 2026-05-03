import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import cvContent from '../content/cv.md?raw'

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-5xl font-light tracking-tight mb-3">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xs font-semibold uppercase tracking-widest mt-14 mb-4 pb-2 border-b border-black">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold mb-1">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm leading-relaxed mb-3 text-black/70">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-sm leading-relaxed text-black/70">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-black">{children}</strong>
  ),
}

export default function CV() {
  return (
    <article className="max-w-2xl mx-auto px-8 py-16">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {cvContent}
      </ReactMarkdown>
    </article>
  )
}
