import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './home01.css'
import SiteFooter from './SiteFooter'

const base = import.meta.env.BASE_URL

/* The agent view: the site as plain, machine-readable text (llms-full.txt), in the new pages' column. */
export default function AgentView() {
  const [text, setText] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`${base}llms-full.txt`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.text()
      })
      .then((t) => active && setText(t))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="h01 h01-placeholder">
      <div className="h01-rail" aria-hidden="true" />
      <main className="h01-col h01-agent">
        <Link className="h01-logo" to="/" aria-label="Amit Kaplinsky, home">
          <img src={`${base}home01/ak-logo.svg`} alt="" width={80} height={45} />
        </Link>
        <h1 className="h01-title">Agent view</h1>
        <p className="h01-role">
          The site as plain text for AI agents. Also at <a href={`${base}llms-full.txt`}>llms-full.txt</a>.
        </p>
        <article className="h01-md">
          {failed ? <p>The text could not be loaded.</p> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>}
        </article>
        <SiteFooter />
      </main>
    </div>
  )
}
