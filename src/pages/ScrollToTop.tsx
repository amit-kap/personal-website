import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/* Every new page opens at its top. A link click (push) or redirect (replace) resets the scroll before the first paint;
   Back and Forward (pop) are left to the browser, so they return to where the visitor was. */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  const type = useNavigationType()
  useLayoutEffect(() => {
    if (type !== 'POP') window.scrollTo(0, 0)
  }, [pathname, type])
  return null
}
