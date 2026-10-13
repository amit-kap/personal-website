import type { ThemeProviderProps } from '@amit-kap/glaze/theme'

/* Shared by ThemeProvider and the pre-paint script in index.html. */
export const THEME_OPTIONS = {
  defaultTheme: 'personal-website',
  defaultMode: 'light',
  storageKey: 'portfolio-theme',
} satisfies Omit<ThemeProviderProps, 'children'>
