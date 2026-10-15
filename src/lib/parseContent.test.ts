import { parseCaseStudies, parseCv, parseWorks } from './parseContent'

const cvFixture = `# Jane Doe

**Designer**

Tel Aviv · [jane@example.com](mailto:jane@example.com)

An intro paragraph.

## Experience

### [Acme Corp](/experience/acme)

**Lead Designer** · 01/2020 to now · Widgets for everyone

- First bullet.
- Second **bold** bullet.

### [No Meta](/experience/no-meta/)

- Only a bullet.

### Not linked

**Ignored** · 2020

## Certificates

### Cert One

Issuer · 2023

## Education

### Degree

School · 1990 to 1994

## Skills

### Craft

- Systems
- Research
`

describe('parseCv', () => {
  const cv = parseCv(cvFixture)

  it('reads the header: name, tagline, contacts and intro', () => {
    expect(cv.header.name).toBe('Jane Doe')
    expect(cv.header.tagline).toBe('Designer')
    expect(cv.header.contacts).toContain('jane@example.com')
    expect(cv.header.intro).toBe('An intro paragraph.')
  })

  it('reads experience entries from the meta line and bullets', () => {
    expect(cv.experience[0]).toEqual({
      slug: 'acme',
      company: 'Acme Corp',
      role: 'Lead Designer',
      period: '01/2020 to now',
      context: 'Widgets for everyone',
      bullets: ['First bullet.', 'Second bold bullet.'],
      summary: 'First bullet.',
    })
  })

  it('tolerates a missing meta line, strips trailing slashes and skips unlinked headings', () => {
    expect(cv.experience.map((e) => e.slug)).toEqual(['acme', 'no-meta'])
    expect(cv.experience[1]).toMatchObject({ role: '', period: '', context: '', summary: 'Only a bullet.' })
  })

  it('reads certificates, education and skills', () => {
    expect(cv.certificates).toEqual([{ title: 'Cert One', meta: 'Issuer · 2023' }])
    expect(cv.education).toEqual([{ title: 'Degree', meta: 'School · 1990 to 1994' }])
    expect(cv.skills).toEqual([{ category: 'Craft', items: ['Systems', 'Research'] }])
  })

  it('returns empty collections for a document with only a title', () => {
    const empty = parseCv('# Only a name')
    expect(empty.header.name).toBe('Only a name')
    expect(empty.experience).toEqual([])
    expect(empty.skills).toEqual([])
  })
})

describe('parseWorks', () => {
  it('reads front matter per slug', () => {
    const [work] = parseWorks({
      shift: '---\nproductTitle: Title\nblurb: Blurb\norder: 2\nhero: 01-a\ntileImage: 02-b\n---\n\nBody',
    })
    expect(work).toEqual({ slug: 'shift', productTitle: 'Title', blurb: 'Blurb', order: 2, hero: '01-a', tileImage: '02-b' })
  })

  it('returns empty fields when there is no (or broken) front matter', () => {
    const works = parseWorks({ plain: 'Just text', broken: '---\nkey: [unclosed\n---\nBody' })
    expect(works.map((w) => w.slug)).toEqual(['plain', 'broken'])
    for (const work of works) expect(work.order).toBeUndefined()
  })
})

describe('parseCaseStudies', () => {
  const doc = (front: string, body = '# The Title\n\nText') => `---\n${front}\n---\n\n${body}\n`

  it('reads the title from the first H1 and the front matter fields', () => {
    const [study] = parseCaseStudies({ story: doc('work: shift\nexcerpt: Short.\nfeatured: true\ncover: c.webp') })
    expect(study).toMatchObject({
      slug: 'story',
      workSlug: 'shift',
      title: 'The Title',
      excerpt: 'Short.',
      featured: true,
      cover: 'c.webp',
    })
    expect(study.body.startsWith('# The Title')).toBe(true)
  })

  it('defaults featured to false and excerpt to empty', () => {
    const [study] = parseCaseStudies({ story: doc('work: shift') })
    expect(study.featured).toBe(false)
    expect(study.excerpt).toBe('')
  })

  it('drops drafts that name no work', () => {
    expect(parseCaseStudies({ draft: doc('excerpt: nope') })).toEqual([])
  })
})
