// Exports every frame of final.html (the locked motion reference) for Blender:
//   <out>/face/NNNN.jpg — the card's screen (browser bar + page) laid flat
//   <out>/states.json   — the card pose per frame (same schema as export.mjs, + zk / ang / axis)
//   <out>/bg.png        — the background plate as framed behind the card
// node blender/export-final.mjs <out-dir> [scale=1]     (needs the preview server, launch.json "shift-motion-preview")
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const { default: puppeteer } = await import(process.env.PPTR ? pathToFileURL(join(process.env.PPTR, 'lib/esm/puppeteer/puppeteer-core.js')).href : 'puppeteer-core')
const [out, scale = '1'] = process.argv.slice(2)
const SW = 1560, SH = 827   // screen incl. the 40px browser bar, tallest page
mkdirSync(join(out, 'face'), { recursive: true })
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
  args: ['--force-color-profile=srgb', '--hide-scrollbars'] })
const page = await browser.newPage()
page.on('pageerror', e => console.error('pageerror:', e.message))
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: +scale })
await page.goto('http://localhost:8932/scripts/shift-motion/final.html')
await page.evaluate(() => window.ready)
const total = Math.round(await page.evaluate(() => window.DURATION) * 30)
// the plate: everything but the card and its shadow
await page.evaluate(() => { window.render(0); document.getElementById('stage').style.visibility = 'hidden'; document.getElementById('floor').style.visibility = 'hidden' })
await page.screenshot({ path: join(out, 'bg.png'), clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 / +scale } })
await page.evaluate(() => { document.getElementById('stage').style.visibility = 'visible' })
const states = []
for (let i = 0; i < total; i++) {
  const st = await page.evaluate(t => new Promise(r => {
    window.render(t)
    const s = { ...window.cardState }
    const card = document.getElementById('card'), stage = document.getElementById('stage')
    stage.style.perspective = 'none'
    Object.assign(card.style, { left: '0px', top: '0px', transform: 'none' })
    requestAnimationFrame(() => requestAnimationFrame(() => r(s)))
  }), i / 30)
  states.push(st)
  await page.screenshot({ path: join(out, 'face', String(i + 1).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 90, clip: { x: 12, y: 12, width: SW, height: SH } })
  await page.evaluate(() => { document.getElementById('stage').style.perspective = '' })
  if (i % 90 === 0) process.stdout.write(`\r${i}/${total}`)
}
// origin: final.html's perspective origin (the 1080px stage's centre); floor: the CSS y the shadow sits on
writeFileSync(join(out, 'states.json'), JSON.stringify({ fps: 30, frames: total, screen: [SW, SH], pad: 12, bottom: 908, origin: 540, floor: 990, states }))
console.log(`\n${total} frames → ${out}`)
await browser.close()
