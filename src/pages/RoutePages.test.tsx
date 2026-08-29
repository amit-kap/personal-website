import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import CaseStudyPage from './CaseStudyPage'
import About from './About'
import WorkItem from './WorkItem'

function renderAt(path: string, routePath: string, element: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('route pages', () => {
  it('renders the Shift story and a compact product story', () => {
    const shift = renderAt('/work/shift', '/work/:slug', <WorkItem />)
    expect(screen.getByRole('heading', { name: /designing shift's agent-led third-party security platform/i })).toBeInTheDocument()
    shift.unmount()

    renderAt('/work/veriti', '/work/:slug', <WorkItem />)
    expect(screen.getByRole('heading', { name: /turning a known exposure into an explained, approved security change/i })).toBeInTheDocument()
  })

  it('renders an article and the About page', () => {
    const article = renderAt('/case-studies/sailing-the-data-oceans', '/case-studies/:slug', <CaseStudyPage />)
    expect(screen.getByRole('heading', { name: /sailing the data oceans/i })).toBeInTheDocument()
    article.unmount()

    renderAt('/about', '/about', <About />)
    expect(screen.getByRole('heading', { name: /still a designer\. the canvas just got bigger/i })).toBeInTheDocument()
  })

  it('shows clear not-found states for missing content', () => {
    const work = renderAt('/work/not-a-product', '/work/:slug', <WorkItem />)
    expect(screen.getByText('Work not found.')).toBeInTheDocument()
    work.unmount()

    renderAt('/case-studies/not-an-article', '/case-studies/:slug', <CaseStudyPage />)
    expect(screen.getByText('Article not found.')).toBeInTheDocument()
  })
})
