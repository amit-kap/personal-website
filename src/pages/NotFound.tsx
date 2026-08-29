import { Link } from 'react-router-dom'
import Seo from '@/components/Seo'

export default function NotFound() {
  return (
    <main className="inner-col flex min-h-[60vh] flex-col items-center justify-center gap-5 py-24 text-center">
      <Seo title="Page not found" description="This page does not exist." path="/404" noIndex />
      <p className="eyebrow">404</p>
      <h1 className="font-heading text-feature font-medium tracking-[-0.02em]">This page does not exist.</h1>
      <Link to="/" className="pill-cta px-[30px] py-3.5 text-[15px]">Back to home</Link>
    </main>
  )
}
