/* App shell: page field, header, routed page and footer, plus scroll
   restoration on navigation. Each page loads separately so visiting one
   route does not download the other pages' content. */
import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import DotWaves from '@/components/DotWaves'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import RouteLoading from '@/components/RouteLoading'
import { useSmoothScroll } from '@/lib/useSmoothScroll'

const Home = lazy(() => import('@/pages/Home'))
const WorkItem = lazy(() => import('@/pages/WorkItem'))
const CaseStudyPage = lazy(() => import('@/pages/CaseStudyPage'))
const About = lazy(() => import('@/pages/About'))
const WorkWithMe = lazy(() => import('@/pages/WorkWithMe'))
const Agent = lazy(() => import('@/pages/Agent'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/* Inside Suspense so the page's DOM is ready before restoring its position,
   including a hash target on a route whose chunk was not cached yet. */
function RouteScrollRestoration({ lenis }: { lenis: ReturnType<typeof useSmoothScroll> }) {
  const location = useLocation()

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

  return null
}

export default function App() {
  const lenis = useSmoothScroll()

  return (
    <div className="relative min-h-screen bg-background">
      {/* The page field: fixed behind everything. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <DotWaves speed={1.5} gap={16} maxRadius={6} />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* The 960px centre column, edge to edge on phones, where it clips the
            hero word's sideways push so the page never scrolls across. */}
        <div className="mx-auto w-full max-w-[960px] flex-1 max-sm:overflow-x-clip">
          <Header />
          <div className="bg-card/90">
            <Suspense fallback={<RouteLoading />}>
              <RouteScrollRestoration lenis={lenis} />
              <Routes>
                <Route path="/" element={<Home />} />
                {/* The blog index (pages/Blog) is hidden for now. */}
                <Route path="/blog" element={<Navigate to="/" replace />} />
                <Route path="/writing" element={<Navigate to="/" replace />} />
                <Route path="/work/:slug" element={<WorkItem />} />
                <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/work-with-me" element={<WorkWithMe />} />
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
