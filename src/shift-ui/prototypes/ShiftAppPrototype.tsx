import { useState, type ComponentType } from 'react'
import { NavigateContext } from '../navigation'
import { Assessments } from '../screens/Assessments'
import { Dashboard } from '../screens/Dashboard'
import { Vendors } from '../screens/Vendors'
import { ScaledScreen } from './ScaledScreen'

/* The three Shift screens as one live app: the sidebar's Home, Inventory and Assessments links switch between them.
   The host can hold the current screen, so the inline and enlarged views stay on the same one. */
const screens: Record<string, ComponentType> = { Home: Dashboard, Inventory: Vendors, Assessments }

export default function ShiftAppPrototype({ screen: held, onScreen, fill }: { screen?: string; onScreen?: (s: string) => void; fill?: boolean }) {
  const [own, setOwn] = useState('Home')
  const screen = held ?? own
  const go = onScreen ?? setOwn
  const Screen = screens[screen] ?? Dashboard
  return (
    <NavigateContext value={(label) => screens[label] && go(label)}>
      <ScaledScreen fill={fill}>
        <Screen />
      </ScaledScreen>
    </NavigateContext>
  )
}
