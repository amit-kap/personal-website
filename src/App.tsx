import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home'
import HomeAS from '@/pages/HomeAS'
import AgentView from '@/pages/AgentView'
import CaseStudy from '@/pages/CaseStudy'
import ShiftPage from '@/pages/ShiftPage'
import VeritiPage from '@/pages/VeritiPage'
import CheckPointPage from '@/pages/CheckPointPage'
import CvPage from '@/pages/CvPage'

/* Home is the new version (3d-screens-back). HomeAS keeps the anti-slop
   superhero home on the side; dev only, not prerendered or in the sitemap. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/as-hero" element={<HomeAS />} />
      <Route path="/case-studies/:slug" element={<CaseStudy />} />
      <Route path="/agent" element={<AgentView />} />
      <Route path="/cv" element={<CvPage />} />
      <Route path="/work/checkpoint" element={<CheckPointPage />} />
      <Route path="/work/shift" element={<ShiftPage />} />
      <Route path="/work/veriti" element={<VeritiPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
