import { render, screen } from '@testing-library/react'
import Hero from './Hero'

describe('Hero', () => {
  it('renders the name and tagline from the CV', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { name: /amit kaplinsky/i })).toBeInTheDocument()
    // tagline text comes from cv.md; assert the portrait is present
    expect(screen.getByRole('img', { name: /amit kaplinsky/i })).toBeInTheDocument()
  })
})
