import { buttonVariants } from '@amit-kap/glaze/components/button'
import { cn } from '@amit-kap/glaze/lib/utils'

/* The site's orange action pill: Glaze's Button, shaped as a pill. Applied to
   links (<a>, <Link>) rather than <button>, so navigation stays a real anchor.
   The hover darkens the brand rather than fading it, and the press scales
   down; both timings match the original pill. Pass spacing and text size. */
export function pillButton(className?: string) {
  return cn(
    buttonVariants({ size: 'lg' }),
    'h-auto gap-2 rounded-pill border-0 transition-[background-color,transform] duration-[180ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
    'hover:bg-[color-mix(in_srgb,var(--primary),black_11%)] focus-visible:bg-[color-mix(in_srgb,var(--primary),black_11%)]',
    'active:not-aria-[haspopup]:translate-y-0 active:scale-[0.97]',
    className,
  )
}
