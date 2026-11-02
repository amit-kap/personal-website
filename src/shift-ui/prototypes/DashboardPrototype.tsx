import '../shift-ui.css'
import { Dashboard } from '../screens/Dashboard'

/* The home dashboard as a live, responsive screen inside the work page. The
   screen scrolls inside itself, like the product does. */
export default function DashboardPrototype() {
  return (
    <div style={{ height: 'min(640px, 78vh)' }}>
      <div className="shift-ui">
        <Dashboard />
      </div>
    </div>
  )
}
