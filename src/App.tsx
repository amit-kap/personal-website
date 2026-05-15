import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Lenis from 'lenis'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Work from '@/pages/Work'
import About from '@/pages/About'
import Playground from '@/pages/Playground'
import ExperienceItem from '@/pages/ExperienceItem'

export default function App() {
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
    const lenis = new Lenis({ duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3) })
    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <div ref={footerRef} className="fixed bottom-0 left-0 right-0 z-0">
        <Footer />
      </div>
      <Nav />
      <div style={{ marginBottom: footerH }}>
        <Routes>
          <Route path="/" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/experience/:slug" element={<ExperienceItem />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}
