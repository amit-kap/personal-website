/* Shared inline icons. */

export function ArrowUpRightIcon() {
  return (
    <svg className="size-3.5" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 12 L12 4 M5.5 4 H12 V10.5" />
    </svg>
  )
}

/* The 22px arrows of the reveal buttons, as on the home page's Featured. */
export function RevealArrow({ back = false }: { back?: boolean }) {
  return (
    <svg className="size-5.5" viewBox="0 0 33 33" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {back ? (
        <>
          <path d="M26.125 16.5H6.875" />
          <path d="M16.5 6.875 6.875 16.5l9.625 9.625" />
        </>
      ) : (
        <>
          <path d="M6.875 16.5h19.25" />
          <path d="M16.5 6.875l9.625 9.625-9.625 9.625" />
        </>
      )}
    </svg>
  )
}

/* Lucide "book-open" at 22px for the related-writing link. */
export function ReadIcon() {
  return (
    <svg className="size-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

export function ArrowBackIcon() {
  return (
    <svg className="size-4" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 4 L4 12 M10.5 12 H4 V5.5" />
    </svg>
  )
}
