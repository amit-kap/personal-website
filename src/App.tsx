import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home'
import HomeAS from '@/pages/HomeAS'
import Placeholder from '@/pages/Placeholder'

/* Home is the new version (3d-screens-back). HomeAS keeps the anti-slop
   superhero home on the side; dev only, not prerendered or in the sitemap. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/as-hero" element={<HomeAS />} />
      {/* Placeholders until these pages are designed. */}
      <Route path="/cv" element={<Placeholder title="CV" />} />
      <Route path="/work/checkpoint" element={<Placeholder title="Check Point" />} />
      <Route path="/work/shift" element={<Placeholder title="Shift" />} />
      <Route path="/work/veriti" element={<Placeholder title="Veriti" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
