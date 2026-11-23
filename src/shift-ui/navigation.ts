import { createContext } from 'react'

/* Lets a host (the dev stage) make the nav links go somewhere. Left empty on
   the work page, where the screens stay put. */
export const NavigateContext = createContext<((label: string) => void) | null>(null)
