import { formatPeriod, splitMeta } from './cvFormat'

describe('formatPeriod', () => {
  it('turns "to now" into an en-dash range ending in Now', () => {
    expect(formatPeriod('10/2024 to now')).toBe('10/2024–Now')
  })

  it('turns a closed range into an en-dash range', () => {
    expect(formatPeriod('04/2024 to 10/2024')).toBe('04/2024–10/2024')
  })

  it('leaves a single date alone', () => {
    expect(formatPeriod('2023')).toBe('2023')
  })
})

describe('splitMeta', () => {
  it('splits the place from the date', () => {
    expect(splitMeta('Coursera · 2023')).toEqual({ place: 'Coursera', date: '2023' })
  })

  it('formats a date range with an en dash', () => {
    expect(splitMeta('Tel Aviv University · 1994 to 1996')).toEqual({ place: 'Tel Aviv University', date: '1994–1996' })
  })

  it('keeps extra separators in the place and takes the last part as the date', () => {
    expect(splitMeta('School · Faculty · 2001')).toEqual({ place: 'School · Faculty', date: '2001' })
  })

  it('returns an empty date when there is none', () => {
    expect(splitMeta('Self-taught')).toEqual({ place: 'Self-taught', date: '' })
  })
})
