import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Home from '@/pages/Home'
import { useSmoothScroll } from '@/lib/useSmoothScroll'

const WorkItem = lazy(() => import('@/pages/WorkItem'))
const CaseStudyPage = lazy(() => import('@/pages/CaseStudyPage'))
const About = lazy(() => import('@/pages/About'))
const Blog = lazy(() => import('@/pages/Blog'))
const CV = lazy(() => import('@/pages/CV'))

export default function App() {
  const location = useLocation()
  const lenis = useSmoothScroll()

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
    <div className="grid-lines relative min-h-screen bg-background">
      <Header />
      {/* The fixed pill nav floats above; pages start below its band. */}
      <div className="pt-[81px] print:pt-0">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/writing" element={<Navigate to="/blog" replace />} />
            <Route path="/work/:slug" element={<WorkItem />} />
            <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/cv" element={<CV />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
