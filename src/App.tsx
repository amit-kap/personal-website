import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import CV from '@/pages/CV'
import Work from '@/pages/Work'
import WorkItem from '@/pages/WorkItem'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar siteName="AK" />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/work" replace />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkItem />} />
        </Routes>
      </main>
    </div>
  )
}
