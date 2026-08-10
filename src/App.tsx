import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Home from '@/pages/Home'

const WorkItem = lazy(() => import('@/pages/WorkItem'))
const CaseStudyPage = lazy(() => import('@/pages/CaseStudyPage'))
const CV = lazy(() => import('@/pages/CV'))
const Writing = lazy(() => import('@/pages/Writing'))

export default function App() {
  const location = useLocation()

  useEffect(() => {
    const scrollTo = () => {
      if (location.hash) {
        const el = document.getElementById(location.hash.slice(1))
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
      window.scrollTo(0, 0)
    }
    // Defer one frame so the new route's DOM is in place
    const raf = requestAnimationFrame(scrollTo)
    return () => cancelAnimationFrame(raf)
  }, [location.pathname, location.hash])

  return (
    <div className="min-h-screen bg-foreground">
      <Header />
      <div className="app-content relative z-10 bg-background">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/work/:slug" element={<WorkItem />} />
            <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
            <Route path="/cv" element={<CV />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
