import { render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import WorkWithMe from './WorkWithMe'

describe('WorkWithMe', () => {
  it('opens with the founder hero and its plain title for screen readers', () => {
    render(<WorkWithMe />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Your product, made clear.')
    expect(screen.getByText('Available for new projects')).toBeInTheDocument()
    expect(screen.getByText(/^I've defined how humans and AI agents share the work/)).toBeInTheDocument()
  })

  it('lists the four problems and three solution steps', () => {
    render(<WorkWithMe />, { wrapper: MemoryRouter })

    const problems = within(screen.getByText('Sound familiar?').closest('section')!).getAllByRole('listitem')
    expect(problems.map((item) => item.querySelector('h3')?.textContent)).toEqual([
      'Your product is hard to explain',
      'Your demo needs narration',
      'Your AI feels powerful but unclear',
      'Your product undersells your company.',
    ])

    const stepList = within(screen.getByText('How I can help').closest('section')!)
    expect(stepList.getAllByRole('listitem')).toHaveLength(3)
    expect(stepList.getAllByRole('heading', { level: 3 }).map((s) => s.textContent)).toEqual(['1. Diagnose', '2. Plan', '3. Build'])
    expect(screen.getByText("I'll design and work with engineering until the fixes are live.")).toBeInTheDocument()
  })

  it('lights every problem and step and draws no disc under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) => ({ matches: query.includes('prefers-reduced-motion'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
    )
    const { container } = render(<WorkWithMe />, { wrapper: MemoryRouter })

    expect(container.querySelectorAll('[data-route="item"]')).toHaveLength(4)
    expect(container.querySelectorAll('[data-route="step"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-route="item"]:not([data-lit]), [data-route="step"]:not([data-lit])')).toHaveLength(0)
    expect(container.querySelector('[data-show]')).not.toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
