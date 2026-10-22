/* The site's two orange action styles, shared by every page. */
import { buttonVariants } from '@amit-kap/glaze/components/button'
import { cn } from '@amit-kap/glaze/lib/utils'

/* Glaze's RevealButton as the site's orange round action: a 46px circle at
   rest (22px icon + 11px padding + 1px border) that opens to its label on
   hover or keyboard focus. */
export const accentRevealButton =
  'h-[46px] min-w-[46px] shrink-0 rounded-pill px-[11px] text-body font-medium text-primary-foreground transition-[padding,background-color] duration-(--duration-moderate) ease-enter hover:px-5 focus-visible:px-5 motion-reduce:transition-none'

/* Glaze's Button, shaped as a pill, for links (<a>, <Link>) rather than
   <button>, so navigation stays a real anchor. The hover darkens the brand
   rather than fading it, and the press scales down; both timings match the
   original pill. Pass spacing and text size. */
export function pillLink(className?: string) {
  return cn(
    buttonVariants({ size: 'lg' }),
    'h-auto gap-2 rounded-pill border-0 transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
    'hover:bg-[color-mix(in_srgb,var(--primary),black_11%)] focus-visible:bg-[color-mix(in_srgb,var(--primary),black_11%)]',
    'active:not-aria-[haspopup]:translate-y-0 active:scale-[0.97]',
    className,
  )
}
