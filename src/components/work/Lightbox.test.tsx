import { useState } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Lightbox from './Lightbox'

function Harness({ chrome = false }: { chrome?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <Lightbox src="/a.png" alt="A screenshot" chrome={chrome} onClose={() => setOpen(false)} />}
    </>
  )
}

function open() {
  const opener = screen.getByRole('button', { name: 'Open' })
  opener.focus()
  fireEvent.click(opener)
  return opener
}

describe('Lightbox', () => {
  it('opens a dialog named by the image alt', () => {
    render(<Harness />)
    open()

    expect(screen.getByRole('dialog', { name: 'A screenshot' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'A screenshot' })).toHaveAttribute('src', '/a.png')
  })

  it('closes on Escape', async () => {
    render(<Harness />)
    open()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes when the backdrop is clicked, but not when the image is', async () => {
    render(<Harness />)
    open()

    fireEvent.click(screen.getByRole('img', { name: 'A screenshot' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('dialog'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('closes from the Close button', async () => {
    render(<Harness />)
    open()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('returns focus to the element that opened it', async () => {
    render(<Harness />)
    const opener = open()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(opener).toHaveFocus()
  })

  it('keeps the window bar only when chrome is requested', () => {
    const { unmount } = render(<Harness chrome />)
    open()
    expect(screen.getByRole('dialog').querySelector('.winbar-lg')).toBeInTheDocument()
    unmount()

    render(<Harness />)
    open()
    expect(screen.getByRole('dialog').querySelector('.winbar-lg')).not.toBeInTheDocument()
  })
})
