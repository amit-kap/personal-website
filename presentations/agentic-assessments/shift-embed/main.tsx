// Standalone Shift Assessments screen, embedded live in the Agentic Assessments deck.
// Built to ../shift-ui/ with `npx vite build -c vite.shift-embed.config.ts`.
import { createRoot } from 'react-dom/client'
import '@/shift-ui/shift-ui.css'
import { NavigateContext } from '@/shift-ui/navigation'
import { Assessments } from '@/shift-ui/screens/Assessments'

createRoot(document.getElementById('root')!).render(
  <NavigateContext value={() => {}}>
    <div className="shift-ui">
      <Assessments />
    </div>
  </NavigateContext>,
)
