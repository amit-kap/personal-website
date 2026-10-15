/* App shell: page field, header, routed page and footer, plus scroll
   restoration on navigation. Only Home loads eagerly; the other routes are
   split into their own chunks. */
import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import DotWaves from '@/components/DotWaves'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Home from '@/pages/Home'
import { useSmoothScroll } from '@/lib/useSmoothScroll'

const WorkItem = lazy(() => import('@/pages/WorkItem'))
const CaseStudyPage = lazy(() => import('@/pages/CaseStudyPage'))
const About = lazy(() => import('@/pages/About'))
const Blog = lazy(() => import('@/pages/Blog'))
const Agent = lazy(() => import('@/pages/Agent'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function App() {
  const location = useLocation()
  const lenis = useSmoothScroll()

  /* On every navigation: scroll to the #hash target if there is one, else to
     the top. Goes through Lenis when smooth scroll is on, since native
     scrolling fights it. */
  useEffect(() => {
    const scrollTo = () => {
      if (location.hash) {
        const el = document.getElementById(location.hash.slice(1))
        if (el) {
          if (lenis.current) lenis.current.scrollTo(el)
          else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
      if (lenis.current) lenis.current.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
    }
    // Defer one frame so the new route's DOM is in place
    const raf = requestAnimationFrame(scrollTo)
    return () => cancelAnimationFrame(raf)
  }, [location.pathname, location.hash, lenis])

  return (
    <div className="relative min-h-screen bg-background">
      {/* The page field: fixed behind everything. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <DotWaves speed={1.5} gap={16} maxRadius={6} />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* The 960px centre column. Pages render into it. */}
        <div className="mx-auto w-full max-w-[960px] flex-1 px-4 sm:px-0">
          <Header />
          <div className="bg-card/90">
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/writing" element={<Navigate to="/blog" replace />} />
                <Route path="/work/:slug" element={<WorkItem />} />
                <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/agent" element={<Agent />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
