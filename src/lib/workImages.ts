import type { ContentImage, Work } from '@/lib/content'

/* Resolve a work image by source-filename prefix (e.g. '01-shift-dashboard'). */
export function imageFor(work: Work, prefix: string): ContentImage | undefined {
  return Object.entries(work.bodyImages).find(([key]) => key.startsWith(prefix))?.[1]
}
