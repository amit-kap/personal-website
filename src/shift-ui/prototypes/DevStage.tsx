/* Dev-only: the Shift screens full-viewport and responsive, so details can be
   inspected at any width. Route: /dev/shift-ui (not part of the build). */
import '../shift-ui.css'
import { Dashboard } from '../screens/Dashboard'

export default function DevStage() {
  return (
    <div data-lenis-prevent style={{ position: 'fixed', inset: 0, zIndex: 100, overflow: 'auto', background: '#fdfdfd' }}>
      <div className="shift-ui">
        <Dashboard />
      </div>
    </div>
  )
}
