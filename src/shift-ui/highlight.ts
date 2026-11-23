import { createContext, useContext } from 'react'

/* Ids of the dashboard widgets the agent is pointing at. Widgets carry a
   data-widget id and light up when it is in this list. */
export const HighlightContext = createContext<string[]>([])

export function useHighlighted(id: string) {
  return useContext(HighlightContext).includes(id)
}
