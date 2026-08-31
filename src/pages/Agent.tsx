import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Seo from '@/components/Seo'
import RollingText from '@/components/RollingText'

export default function Agent() {
  const [markdown, setMarkdown] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/llms-full.txt')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        return response.text()
      })
      .then((text) => {
        if (active) setMarkdown(text)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <main>
      <Seo
        title="Agent view"
        description="A text-first, machine-readable view of Amit Kaplinsky's portfolio and case studies."
        path="/agent"
      />
      <section className="inner-col flex flex-col gap-8 pb-20 pt-16">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-8">
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Agent view</p>
            <h1 className="font-heading text-feature font-medium tracking-[-0.02em]">The portfolio in plain text.</h1>
            <p className="body-copy max-w-[640px]">
              A text-first version of this site for fast reading, indexing, and retrieval.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-meta">
            <Link to="/" className="pill-cta roll-host px-5 py-2.5">
              <RollingText text="Human view" />
            </Link>
            <a href="/llms-full.txt" download className="text-link self-center">Download Markdown</a>
          </div>
        </header>

        {error ? (
          <p className="body-copy">The full text view is temporarily unavailable. You can open the <a href="/llms-full.txt" className="text-link">raw Markdown file</a> directly.</p>
        ) : markdown ? (
          <article className="agent-copy flex max-w-[780px] flex-col gap-5">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h2 className="font-heading text-section font-medium tracking-[-0.02em]">{children}</h2>,
                h2: ({ children }) => <h2 className="mt-8 font-heading text-[28px] font-medium tracking-[-0.02em]">{children}</h2>,
                h3: ({ children }) => <h3 className="mt-6 font-heading text-[22px] font-medium tracking-[-0.015em]">{children}</h3>,
                p: ({ children }) => <p className="body-copy">{children}</p>,
                a: ({ href, children }) => <a href={href} className="text-link">{children}</a>,
                ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 text-[16px] leading-[1.65] text-muted-foreground">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6 text-[16px] leading-[1.65] text-muted-foreground">{children}</ol>,
                blockquote: ({ children }) => <blockquote className="border-l-2 border-accent pl-5 text-[18px] italic leading-[1.55] text-muted-foreground">{children}</blockquote>,
                hr: () => <hr className="my-5 border-border" />,
                img: ({ alt }) => <p className="text-meta text-muted-foreground">Image: {alt}</p>,
              }}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        ) : (
          <p className="body-copy">Loading the full portfolio text…</p>
        )}
      </section>
    </main>
  )
}
