import { Link } from 'react-router-dom'
import Seo from '@/components/Seo'
import { pillButton } from '@/components/pillButton'

export default function NotFound() {
  return (
    <main className="inner-col flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <Seo title="Page not found" description="This page does not exist." path="/404" noIndex />
      <p className="eyebrow">404</p>
      <h1 className="font-heading text-feature font-medium">This page does not exist.</h1>
      <Link to="/" className={pillButton('px-7.5 py-3.5 text-meta')}>Back to home</Link>
    </main>
  )
}
