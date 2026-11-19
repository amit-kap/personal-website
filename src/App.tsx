import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/Home'

/* Rebuild in progress: Home is the new layout. Other pages come next. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
