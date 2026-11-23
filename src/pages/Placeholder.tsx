import { Link } from 'react-router-dom'
import './home01.css'

const base = import.meta.env.BASE_URL

/* A stand-in for inner pages (CV, Shift, Veriti) until each is designed in Paper. */
export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="h01 h01-placeholder">
      <div className="h01-rail" aria-hidden="true" />
      <main className="h01-col">
        <Link className="h01-logo" to="/" aria-label="Amit Kaplinsky, home">
          <img src={`${base}home01/ak-logo.svg`} alt="" width={80} height={45} />
        </Link>
        <h1 className="h01-title">{title}</h1>
        <p className="h01-role">This page is on its way.</p>
        <Link className="h01-link h01-back" to="/">
          <span>Back home</span>
        </Link>
      </main>
    </div>
  )
}
