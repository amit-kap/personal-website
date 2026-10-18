/* The site's pages, as the header and footer link them. The header shows
   Home and About; the footer lists every page. */
export const footerNav = [
  { label: 'Home', to: '/' },
  { label: 'Work with me', to: '/work-with-me' },
  { label: 'About', to: '/about' },
]

export const headerNav = footerNav.filter((item) => item.to !== '/work-with-me')

/* Home is also current on the work pages; the other items match exactly. */
export function isActive(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/' || pathname.startsWith('/work/')
  return pathname === to
}
