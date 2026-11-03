// Exports what Blender needs from scene.html, one entry per video frame:
//   cache/face/NNNN.jpg — the card's screen content, rendered flat (no card transform, no glass) at 2x
//   cache/states.json   — the card's motion (pose, flip angle/axis, zoom push, size) in CSS px / degrees
// node blender/export.mjs            (all frames)
// node blender/export.mjs 0 120      (frames [0, 120) only — states.json is always written in full)
// PPTR=/path/to/node_modules/puppeteer-core node blender/export.mjs   when puppeteer-core isn't resolvable here
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const { default: puppeteer } = await import(process.env.PPTR ? pathToFileURL(join(process.env.PPTR, 'lib/esm/puppeteer/puppeteer-core.js')).href : 'puppeteer-core')
const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '../../..')
const html = readFileSync(join(here, '../scene.html'), 'utf8')
  .replaceAll('FONTDIR', `file://${repo}/node_modules/@fontsource/geist-sans/files`)
  .replaceAll('IMGDIR', `file://${repo}/src/content/experience/shift`)
const built = join(here, '../built.html')
writeFileSync(built, html)

const FPS = 30, SCALE = 2
const SW = 1560, SH = 787   // screen area (RW × tallest page), captured from the card's top-left + bezel
const out = join(here, 'cache'), faces = join(out, 'face')
mkdirSync(faces, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files', '--force-color-profile=srgb', '--hide-scrollbars'],
})
const page = await browser.newPage()
page.on('pageerror', e => console.error('pageerror:', e.message))
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: SCALE })
await page.goto(`file://${built}`)
await page.evaluate(() => window.ready)
const total = Math.round(await page.evaluate(() => window.DURATION) * FPS)
const [a = 0, b = total] = process.argv.slice(2).map(Number)

// render frame t, record the card state, then lay the card flat at the top-left with the glass hidden
const step = (t, shoot) => page.evaluate((t, shoot) => new Promise(r => {
  window.render(t)
  const s = { ...window.cardState }
  if (shoot) {
    const card = document.getElementById('card')
    Object.assign(card.style, { zoom: 1, left: '0px', top: '0px', transform: 'none', opacity: 1 })
    document.getElementById('glass').style.display = document.getElementById('sheen').style.display = 'none'
    document.getElementById('floor').style.display = 'none'
  }
  requestAnimationFrame(() => requestAnimationFrame(() => r(s)))
}), t, shoot)

const states = []
for (let i = 0; i < total; i++) {
  const shoot = i >= a && i < b
  states.push(await step(i / FPS, shoot))
  if (shoot) {
    await page.screenshot({ path: join(faces, String(i + 1).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 92,
      clip: { x: 12, y: 12, width: SW, height: SH } })
    if (i % 60 === 0) process.stdout.write(`\r${i}/${total}`)
  }
}
writeFileSync(join(out, 'states.json'), JSON.stringify({ fps: FPS, frames: total, screen: [SW, SH], pad: 12, bottom: 908, states }))
console.log(`\n${total} frames → ${out}`)
await browser.close()
