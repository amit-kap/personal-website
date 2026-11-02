import '../shift-ui.css'
import { Dashboard } from '../screens/Dashboard'

/* The home dashboard as a live, responsive screen inside the work page. It
   scrolls on its own, like the product does; data-lenis-prevent keeps the
   page's smooth scroll from taking the wheel. */
export default function DashboardPrototype() {
  return (
    <div data-lenis-prevent style={{ height: 'min(640px, 78vh)', overflow: 'auto', overscrollBehavior: 'contain' }}>
      <div className="shift-ui">
        <Dashboard />
      </div>
    </div>
  )
}
