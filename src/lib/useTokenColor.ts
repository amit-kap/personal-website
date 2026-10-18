import { useState } from 'react'

/* Canvas colours can't read custom properties, so resolve the token from
   the root. The body renders client-side only, so the document is there. */
export function useTokenColor(token: string) {
  const [color] = useState(
    () => getComputedStyle(document.documentElement).getPropertyValue(token).trim() || 'transparent',
  )
  return color
}
