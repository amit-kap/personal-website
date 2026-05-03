import { Routes, Route, Navigate } from 'react-router-dom'
import CV from '@/pages/CV'
import ExperienceItem from '@/pages/ExperienceItem'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <main>
        <Routes>
          <Route path="/" element={<CV />} />
          <Route path="/experience/:slug" element={<ExperienceItem />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
