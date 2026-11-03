// Renders final.html (the locked motion reference, captions and digital background included) straight to video.
//   node render-final.mjs out.mp4              full film
//   node render-final.mjs out.mp4 8.5 12       only [8.5s, 12s) — for checking a range
// Needs the preview server (launch.json "shift-motion-preview") and PPTR=<dir>/node_modules/puppeteer-core.
// Frames are rendered at 2x and downscaled with lanczos so text and zooms stay crisp.
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const { default: puppeteer } = await import(process.env.PPTR ? pathToFileURL(join(process.env.PPTR, 'lib/esm/puppeteer/puppeteer-core.js')).href : 'puppeteer-core')
const [out, from, to] = process.argv.slice(2)
const FPS = 30, SCALE = 2
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true,
  args: ['--force-color-profile=srgb', '--hide-scrollbars'] })
const page = await browser.newPage()
page.on('pageerror', e => console.error('pageerror:', e.message))
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: SCALE })
await page.goto('http://localhost:8932/scripts/shift-motion/final.html')
await page.evaluate(() => window.ready)
const duration = await page.evaluate(() => window.DURATION)
const a = Math.round(Number(from ?? 0) * FPS), b = Math.min(Math.round(duration * FPS), Math.round(Number(to ?? duration) * FPS))
const frameAt = t => page.evaluate(t => new Promise(r => { window.render(t); requestAnimationFrame(() => requestAnimationFrame(r)) }), t).then(() => page.screenshot({ type: 'png', optimizeForSpeed: true }))

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
  '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out],
  { stdio: ['pipe', 'inherit', 'inherit'] })
for (let i = a; i < b; i++) {
  const buf = await frameAt(i / FPS)
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r))
  if ((i - a) % 30 === 0) process.stdout.write(`\r${i - a}/${b - a}`)
}
ff.stdin.end()
await new Promise(r => ff.on('close', r))
await browser.close()
console.log(`\nwrote ${out}  (${(b - a) / FPS}s)`)
