/* Keep the page column and footer in place while a route chunk arrives.
   Navigation stays available, and the status needs no animation or assets. */
export default function RouteLoading() {
  return (
    <div role="status" className="flex min-h-[70vh] flex-col items-center gap-8 px-4 py-20">
      <span className="text-meta text-muted-foreground">Loading page…</span>
      <div aria-hidden="true" className="flex w-full max-w-[586px] flex-col items-center gap-4">
        <div className="h-10 w-3/4 rounded-item bg-muted/30" />
        <div className="h-10 w-full rounded-item bg-muted/30" />
        <div className="mt-4 h-3 w-2/3 rounded-item bg-muted/20" />
      </div>
    </div>
  )
}
