import type { ContentImage, Work } from '@/lib/content'

/* Resolve a work image by source-filename prefix (e.g. '01-shift-dashboard'). */
export function imageFor(work: Work, prefix: string): ContentImage | undefined {
  return Object.entries(work.bodyImages).find(([key]) => key.startsWith(prefix))?.[1]
}

/* Every image of a work, ordered by filename, with `firstPrefix` pulled to the
   front so the card's chosen frame is the one at rest. */
export function galleryFor(work: Work, firstPrefix: string): ContentImage[] {
  const entries = Object.entries(work.bodyImages)
  const lead = entries.find(([key]) => key.startsWith(firstPrefix))
  const rest = entries.filter(([key]) => key !== lead?.[0])
  return [...(lead ? [lead] : []), ...rest].map(([, image]) => image)
}
