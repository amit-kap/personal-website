/* Dev-only: the Shift screens full-viewport and responsive, so details can be
   inspected at any width. Routes: /dev/shift-ui (home) and
   /dev/shift-ui/vendors (not part of the build). */
import { useNavigate, useParams } from 'react-router-dom'
import '../shift-ui.css'
import { NavigateContext } from '../navigation'
import { Dashboard } from '../screens/Dashboard'
import { Vendors } from '../screens/Vendors'

const routes: Record<string, string> = { Home: '/dev/shift-ui', Inventory: '/dev/shift-ui/vendors' }

export default function DevStage() {
  const { screen } = useParams()
  const navigate = useNavigate()
  const Screen = screen === 'vendors' ? Vendors : Dashboard
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#fdfdfd' }}>
      <NavigateContext value={(label) => routes[label] && navigate(routes[label])}>
        <div className="shift-ui">
          <Screen />
        </div>
      </NavigateContext>
    </div>
  )
}
