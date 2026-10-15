import { getAllWorks } from './content'
import { logoFor } from './workLogos'

describe('logoFor', () => {
  it('has a logo for every work', () => {
    for (const work of getAllWorks()) expect(logoFor(work.slug)).toBeTruthy()
  })

  it('returns undefined for an unknown slug', () => {
    expect(logoFor('not-a-company')).toBeUndefined()
  })
})
