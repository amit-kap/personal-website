// node render.mjs stills 1,5.5,8   → PNG stills
// node render.mjs video out.mp4     → full render
// node render.mjs patch 8.4 17 out.mp4 → re-render only [8.4s, 17s) and splice it into the existing out.mp4
//   (only valid when the edit doesn't shift timing)
import { readFileSync, writeFileSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '../..')
const html = readFileSync(join(here, 'scene.html'), 'utf8')
  .replaceAll('FONTDIR', `file://${repo}/node_modules/@fontsource/geist-sans/files`)
  .replaceAll('IMGDIR', `file://${repo}/src/content/experience/shift`)
const built = join(here, 'built.html')
writeFileSync(built, html)

const [mode, arg, ...rest] = process.argv.slice(2)
const FPS = 30
const SCALE = 2  // supersample: render at 2x, downscale in ffmpeg for crisp text and zooms
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--allow-file-access-from-files', '--force-color-profile=srgb', '--hide-scrollbars'],
})
const page = await browser.newPage()
page.on('console', m => console.log('page:', m.text()))
page.on('pageerror', e => console.error('pageerror:', e.message))
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: SCALE })
await page.goto(`file://${built}`)
await page.evaluate(() => window.ready)
const duration = await page.evaluate(() => window.DURATION)

const frameAt = async t => {
  await page.evaluate(t => new Promise(r => { window.render(t); requestAnimationFrame(() => requestAnimationFrame(r)) }), t)
  return page.screenshot({ type: 'png', optimizeForSpeed: true })
}

if (mode === 'stills') {
  mkdirSync(join(here, 'stills'), { recursive: true })
  for (const t of arg.split(',').map(Number)) {
    writeFileSync(join(here, 'stills', `t${t.toFixed(2)}.png`), await frameAt(t))
  }
} else {
  const run = args => new Promise((res, rej) => spawn('ffmpeg', args, { stdio: 'inherit' }).on('close', c => c ? rej(new Error(`ffmpeg ${c}`)) : res()))
  // pipe frames [a, b) into ffmpeg at the given quality
  const encode = async (a, b, out, crf) => {
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-vf', 'scale=1920:1080:flags=lanczos',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', out], { stdio: ['pipe', 'inherit', 'inherit'] })
    for (let i = a; i < b; i++) {
      const buf = await frameAt(i / FPS)
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r))
      if ((i - a) % 60 === 0) process.stdout.write(`\r${i - a}/${b - a}`)
    }
    ff.stdin.end()
    await new Promise(r => ff.on('close', r))
  }
  const total = Math.round(duration * FPS)
  if (mode === 'patch') {
    const out = rest[1]
    const a = Math.round(Number(arg) * FPS), b = Math.min(total, Math.round(Number(rest[0]) * FPS))
    const seg = join(here, 'patch-seg.mp4'), tmp = join(here, 'patch-out.mp4')
    await encode(a, b, seg, 10)
    // existing [0,a) + new [a,b) + existing [b,end), re-encoded once at the normal quality
    await run(['-y', '-loglevel', 'error', '-i', out, '-i', seg, '-filter_complex',
      `[0:v]trim=end_frame=${a},setpts=PTS-STARTPTS[x];[1:v]setpts=PTS-STARTPTS[y];[0:v]trim=start_frame=${b},setpts=PTS-STARTPTS[z];[x][y][z]concat=n=3:v=1[v]`,
      '-map', '[v]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', tmp])
    renameSync(tmp, out); rmSync(seg)
    console.log(`\npatched frames ${a}-${b} of ${out}`)
  } else {
    await encode(0, total, arg, 20)
    console.log(`\nwrote ${arg}`)
  }
}
await browser.close()
