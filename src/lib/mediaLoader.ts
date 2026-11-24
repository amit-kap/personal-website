/* One loading state for every image and video on the site: while a file is still on its way, the element carries
   data-loading, and index.css draws a soft shimmer in its place (or a spinner in the full-screen viewer). Watching
   the DOM covers every page, the lazy images and the viewer, with no wrapper to remember in each component.
   SVGs (the logos) load instantly and are skipped, as is anything marked data-no-loader. */

type Media = HTMLImageElement | HTMLVideoElement

const ready = (el: Media) =>
  el instanceof HTMLImageElement ? el.complete && el.naturalWidth > 0 : el.readyState >= 2 // HAVE_CURRENT_DATA

const skip = (el: Media) => {
  const src = el.getAttribute('src') ?? ''
  return el.hasAttribute('data-no-loader') || /\.svg($|\?)/i.test(src) || !src
}

function track(el: Media) {
  if (skip(el) || ready(el)) {
    el.removeAttribute('data-loading')
    return
  }
  el.setAttribute('data-loading', '')
  const done = () => {
    el.removeAttribute('data-loading')
    el.removeEventListener('load', done)
    el.removeEventListener('loadeddata', done)
    el.removeEventListener('error', done)
  }
  el.addEventListener(el instanceof HTMLImageElement ? 'load' : 'loadeddata', done)
  el.addEventListener('error', done)
}

function scan(node: Node) {
  if (node instanceof HTMLImageElement || node instanceof HTMLVideoElement) track(node)
  else if (node instanceof Element) node.querySelectorAll<Media>('img, video').forEach(track)
}

export function startMediaLoader(root: Element = document.body) {
  scan(root)
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') scan(r.target) // a new src on the same element (the viewer reuses its <img>)
      else r.addedNodes.forEach(scan)
    }
  }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })
}
