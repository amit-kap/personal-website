import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WorkWithMe from './WorkWithMe'

describe('WorkWithMe', () => {
  it('opens with the founder hero and its plain title for screen readers', () => {
    render(<WorkWithMe />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Your product, made clear.')
    expect(screen.getByText('Available for new projects')).toBeInTheDocument()
    expect(screen.getByText(/^For founders of complex B2B, AI and dev-tool products/)).toBeInTheDocument()
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

    const steps = within(screen.getByText('How I can help').closest('section')!).getAllByRole('heading', { level: 3 })
    expect(steps.map((s) => s.textContent)).toEqual(['Diagnose', 'Plan', 'Build'])
    expect(screen.getByText("I'll design and work with engineering until the fixes are live.")).toBeInTheDocument()
  })
})
