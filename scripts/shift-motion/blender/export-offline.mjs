// Exports one frame of the offline card cut for a Blender still:
//   <out>/face/0001.jpg — the card's screen (browser bar + page) rendered flat at 2x
//   <out>/bg.png        — the background plate exactly as framed behind the card (when ?bg= is given)
//   <out>/states.json   — the card pose in the same schema as export.mjs
// node blender/export-offline.mjs <t> <out-dir> [extra query, e.g. "bg=/scripts/shift-motion/bg-test.jpg"]
// Needs the preview server (launch.json "shift-motion-preview") on :8932.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const { default: puppeteer } = await import(process.env.PPTR ? pathToFileURL(join(process.env.PPTR, 'lib/esm/puppeteer/puppeteer-core.js')).href : 'puppeteer-core')
const [t, out, extra = ''] = process.argv.slice(2)
mkdirSync(join(out, 'face'), { recursive: true })
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
  args: ['--force-color-profile=srgb', '--hide-scrollbars'] })
const page = await browser.newPage()
page.on('pageerror', e => console.error('pageerror:', e.message))
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 })
await page.goto(`http://localhost:8932/scripts/shift-motion/offline.html?card&${extra}`)
await page.evaluate(() => window.ready)
const state = await page.evaluate(t => new Promise(r => { window.render(t); requestAnimationFrame(() => requestAnimationFrame(() => r(window.cardState))) }), +t)
// background plate: everything but the card
await page.evaluate(() => { document.getElementById('stage').style.visibility = 'hidden'; document.getElementById('floor').style.visibility = 'hidden' })
await page.screenshot({ path: join(out, 'bg.png'), clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 0.5 } })
// flat face: the card laid flat at the top-left, its screen captured
await page.evaluate(() => {
  document.getElementById('stage').style.visibility = 'visible'
  const st = document.getElementById('stage'); st.style.webkitBoxReflect = 'none'; st.style.perspective = 'none'
  Object.assign(document.getElementById('card').style, { left: '0px', top: '0px', transform: 'none' })
})
const [SW, SH] = state.screen
await page.screenshot({ path: join(out, 'face', '0001.jpg'), type: 'jpeg', quality: 95, clip: { x: 12, y: 12, width: SW, height: SH } })
writeFileSync(join(out, 'states.json'), JSON.stringify({ fps: 30, frames: 1, screen: [SW, SH], pad: 12, bottom: 908, states: [state] }))
console.log('exported', JSON.stringify(state))
await browser.close()
