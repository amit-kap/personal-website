/* Display formatting for CV dates. */

/* cv.md writes periods as "10/2024 to now"; the page renders "10/2024–Now". */
export function formatPeriod(period: string): string {
  return period.replace(' to ', '–').replace(/now$/i, 'Now')
}

/* Certificates and education store "Institution · dates" in one meta line;
   split it so the date sits in the left column like an experience period. */
export function splitMeta(meta: string): { place: string; date: string } {
  const parts = meta.split(' · ')
  const date = parts.length > 1 ? parts.pop()! : ''
  return { place: parts.join(' · '), date: date.replace(' to ', '–') }
}
