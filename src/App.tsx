import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Work from '@/pages/Work'
import About from '@/pages/About'
import Playground from '@/pages/Playground'
import ExperienceItem from '@/pages/ExperienceItem'
import Writing from '@/pages/Writing'
import WritingPost from '@/pages/WritingPost'
import CV from '@/pages/CV'

export default function App() {
  const location = useLocation()
  const footerRef = useRef<HTMLDivElement | null>(null)
  const [footerH, setFooterH] = useState(0)
  const lenisRef = useRef<Lenis | null>(null)

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
    const lenis = new Lenis({ duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3) })
    lenisRef.current = lenis
    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 z-0">
        <Footer />
      </div>
      <Nav />
      <div className="app-content" style={{ marginBottom: footerH }}>
        <Routes>
          <Route path="/" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/writing/:slug" element={<WritingPost />} />
          <Route path="/experience/:slug" element={<ExperienceItem />} />
          <Route path="/cv" element={<CV />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}
