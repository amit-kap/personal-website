import type { ThemeProviderProps } from '@amit-kap/glaze/theme'

/* Shared by ThemeProvider and the pre-paint script in index.html. */
export const THEME_OPTIONS = {
  defaultTheme: 'personal-website',
  defaultMode: 'dark',
  storageKey: 'portfolio-theme-v2',
} satisfies Omit<ThemeProviderProps, 'children'>
