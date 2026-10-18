import { getWorkBySlug } from './content'
import { imageFor } from './workImages'

describe('imageFor', () => {
  const shift = getWorkBySlug('shift')!

  it('finds an image by source-filename prefix', () => {
    expect(imageFor(shift, '01-shift-dashboard')).toBe(shift.bodyImages['01-shift-dashboard.webp'])
    expect(imageFor(shift, '01-shift-dashboard')?.src).toBeTruthy()
  })

  it('returns undefined when no image matches', () => {
    expect(imageFor(shift, 'does-not-exist')).toBeUndefined()
  })
})
