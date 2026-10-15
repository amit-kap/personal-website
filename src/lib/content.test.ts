import { getAllCaseStudies, getAllWorks, getCV, getCaseStudyBySlug, getWorkBySlug } from './content'

describe('getCV', () => {
  const cv = getCV()

  it('has the header, experience, certificates, education and skills', () => {
    expect(cv.header.name).toBe('Amit Kaplinsky')
    expect(cv.header.intro).not.toBe('')
    expect(cv.experience.length).toBeGreaterThan(0)
    expect(cv.certificates.length).toBeGreaterThan(0)
    expect(cv.education.length).toBeGreaterThan(0)
    expect(cv.skills.length).toBeGreaterThan(0)
  })

  it('gives every experience a slug, company, role, period and bullets', () => {
    for (const entry of cv.experience) {
      expect(entry.slug).toMatch(/^[a-z-]+$/)
      expect(entry.company).not.toBe('')
      expect(entry.role).not.toBe('')
      expect(entry.period).toMatch(/^\d{2}\/\d{4} to (\d{2}\/\d{4}|now)$/)
      expect(entry.bullets.length).toBeGreaterThan(0)
      expect(entry.summary).toBe(entry.bullets[0])
      expect(entry.hasImages).toBe(entry.images.length > 0)
    }
  })

  it('lists Shift first', () => {
    expect(cv.experience[0]).toMatchObject({ slug: 'shift', company: 'Shift', period: '10/2024 to now' })
  })
})

describe('works', () => {
  it('are ordered ascending, with Shift first', () => {
    const works = getAllWorks()
    expect(works.map((w) => w.slug)).toEqual(['shift', 'onyxia-cyber', 'veriti', 'semperis', 'checkpoint'])
    const orders = works.map((w) => w.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('look up by slug, and return undefined for unknown slugs', () => {
    expect(getWorkBySlug('veriti')?.company).toBe('Veriti')
    expect(getWorkBySlug('nope')).toBeUndefined()
  })

  it('carry a blurb, a product title and a hero image', () => {
    for (const work of getAllWorks()) {
      expect(work.blurb).not.toBe('')
      expect(work.productTitle).not.toBe('')
      expect(work.heroImage?.src).toBeTruthy()
      expect(work.tileImage).toBeDefined()
    }
  })
})

describe('case studies', () => {
  it('each link to an existing work', () => {
    const studies = getAllCaseStudies()
    expect(studies.length).toBeGreaterThan(0)
    for (const study of studies) {
      expect(getWorkBySlug(study.workSlug)).toBeDefined()
      expect(study.title).not.toBe('')
      expect(study.body.startsWith('# ')).toBe(true)
    }
  })

  it('are kept alongside their work order', () => {
    const order = getAllCaseStudies().map((s) => getWorkBySlug(s.workSlug)!.order)
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('look up by slug, and return undefined for unknown slugs', () => {
    expect(getCaseStudyBySlug('sailing-the-data-oceans')?.workSlug).toBe('veriti')
    expect(getCaseStudyBySlug('nope')).toBeUndefined()
  })
})
