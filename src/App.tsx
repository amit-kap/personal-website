import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import WorkItem from '@/pages/WorkItem'
import CaseStudyPage from '@/pages/CaseStudyPage'
import CV from '@/pages/CV'

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [footerH, setFooterH] = useState(0)

  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setFooterH(entry.contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
    <>
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 z-0">
        <Footer />
      </div>
      {!isHome && <Nav />}
      <div className="app-content" style={{ marginBottom: footerH }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<WorkItem />} />
          <Route path="/case-studies/:slug" element={<CaseStudyPage />} />
          <Route path="/cv" element={<CV />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}
