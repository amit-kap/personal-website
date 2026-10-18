/* True unless the visitor prefers reduced motion; follows live changes.
   Starts true and corrects after mount, so motion is on until the
   query says otherwise. */
import { useEffect, useState } from 'react'

export function useAllowMotion() {
  const [allow, setAllow] = useState(true)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setAllow(!query.matches)
    update()
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  return allow
}
