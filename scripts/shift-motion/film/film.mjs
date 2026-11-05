// The Shift film pipeline: one command, same quality every time.
//   node film.mjs all                       export -> render only what changed -> composite captions -> encode
//   node film.mjs captions                  caption layer only (no Blender): copy and typing changes
//   node film.mjs export [--layers a,b]     layers: face, plate, cap   (all by default)
//   node film.mjs render                    Blender, only frames whose cache key is new
//   node film.mjs encode                    composite + encode from what is cached
//   node film.mjs gate                      4 HQ stills of the current film beside the approved site film
//   node film.mjs status                    what is cached / what would render
//   node film.mjs doctor                    checks the tools and files the pipeline needs
//   node film.mjs verify                    re-exports 12 frames and checks they are byte-identical to the cache
// Flags: --draft (32 samples, own cache keys, output film-draft.mp4)   --frames a-b (export/render a range)
// Starts its own page server on port 8932 if none is running. Needs Blender, ffmpeg, Chrome. Settings: film.config.json.
// Cache layout (build/, gitignored): seq/{face,bgseq,cap}/NNNN, seq/states.json, manifest.json, cards/<key>.png (rendered
// frames, keyed by content), out/film.mp4. A card key hashes the face, plate, pose of this and the next frame, the render
// config and build.py, so any edit re-renders exactly the frames it changed and nothing else.
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CFG = JSON.parse(readFileSync(join(HERE, 'film.config.json'), 'utf8'))
const BLENDER = process.env.BLENDER || '/Applications/Blender.app/Contents/MacOS/Blender'
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BUILD_PY = resolve(HERE, '../blender/build.py')
const BUILD = join(HERE, 'build')
const argv = process.argv.slice(2)
const cmd = argv[0] || 'status'
const flag = n => { const i = argv.indexOf('--' + n); return i < 0 ? null : (argv[i + 1]?.startsWith('--') ? true : argv[i + 1] ?? true) }
const DRAFT = !!flag('draft')
if (DRAFT) CFG.render = { ...CFG.render, samples: 32 }
const [SW, SH] = CFG.face.screen, SCALE = CFG.face.scale, FPS = CFG.fps, [W, H] = CFG.res
const PAGE = 'http://localhost:8932/scripts/shift-motion/final.html'
const PLATE_PAGE = 'http://localhost:8932/scripts/shift-motion/film/' + CFG.plate.page

const sha = b => createHash('sha1').update(b).digest('hex').slice(0, 16)
const fail = m => { console.error('\n✗ ' + m); process.exit(1) }
const frameName = i => String(i).padStart(4, '0')
const run = (c, a, o = {}) => { const r = spawnSync(c, a, { stdio: 'inherit', ...o }); if (r.status !== 0) fail(`${c} failed (${r.status})`); return r }
const readJson = (p, d) => existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : d

// ------------------------------------------------------------------ jpeg size (hard check that the face really is high-res)
function jpegSize(file) {
  const d = readFileSync(file)
  for (let i = 2; i < d.length;) { const m = d[i + 1], L = d.readUInt16BE(i + 2)
    if (m === 0xC0 || m === 0xC2) return [d.readUInt16BE(i + 7), d.readUInt16BE(i + 5)]
    i += 2 + L }
  fail('not a jpeg: ' + file)
}

// Chrome's raster output can differ by a level on a few pixels between runs. Two images are the same if no pixel's
// luma differs by more than CFG.tolerance, so a re-export keeps the cached file and its render key (no pointless re-render).
function sameImage(a, b) {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-i', a, '-i', b, '-lavfi', '[0][1]blend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YMAX', '-f', 'null', '-'], { encoding: 'utf8' })
  const m = (r.stderr + r.stdout).match(/YMAX=(\d+)/)
  return !!m && +m[1] <= CFG.tolerance
}

// ------------------------------------------------------------------ export (Chrome)
// list = frame indices to export (0-based times i/fps); outputs are numbered by position in the list, so a gate export
// of a few moments and the full film use the same code.
async function exportLayers(list, dir, layers, offset = 0) {
  const { default: puppeteer } = await import(process.env.PPTR ? 'file://' + join(process.env.PPTR, 'lib/esm/puppeteer/puppeteer-core.js') : 'puppeteer-core')
  for (const l of ['face', 'bgseq', 'cap']) mkdirSync(join(dir, l), { recursive: true })
  const manifestFile = join(dir, 'manifest.json')
  const man = readJson(manifestFile, { face: [], plate: [], cap: [] })
  const states = readJson(join(dir, 'states.json'), { states: [] }).states
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars', ...(process.env.FILM_CHROME_ARGS || '').split(' ').filter(Boolean)] })
  const page = await browser.newPage()
  page.on('pageerror', e => console.error('pageerror:', e.message))
  await page.setViewport({ width: W, height: H, deviceScaleFactor: SCALE })
  await page.goto(PAGE)
  await page.evaluate(() => window.ready)
  let plate = null, pbrowser = null   // the animated background texture lives on its own page (film/bg/v5.html), in its own browser so it is never a background tab
  if (layers.has('plate')) { pbrowser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-color-profile=srgb', '--hide-scrollbars'] }); plate = await pbrowser.newPage(); plate.on('pageerror', e => console.error('pageerror:', e.message)); await plate.setViewport({ width: W, height: H, deviceScaleFactor: CFG.plate.scale }); await plate.goto(PLATE_PAGE); await plate.evaluate(() => window.ready) }
  await page.evaluate(() => document.fonts.ready)
  const total = Math.round(await page.evaluate(() => window.DURATION) * FPS)
  const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
  const show = (ids, on) => page.evaluate((ids, on) => { for (const id of ids) document.getElementById(id).style.display = on ? '' : 'none' }, ids, on)
  const full = { x: 0, y: 0, width: W, height: H, scale: 1 / SCALE }   // layers other than the face are 1x
  let prevFace = null, prevFaceFile = null
  const t0 = Date.now()
  for (let k = 0; k < list.length; k++) {
    const n = k + offset, i = list[k], tag = frameName(n + 1)
    await page.evaluate(t => { window.render(t); for (const a of document.getAnimations()) a.pause() }, i / FPS); await settle()
    if (layers.has('plate')) {   // the animated v5 texture at t, mapped onto the backdrop sphere by build.py
      await plate.evaluate(t => { window.renderBg(t); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))) }, i / FPS)
      const png = await plate.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H } })
      const f = join(dir, 'bgseq', tag + '.jpg'), nf = f + '.new.jpg'
      run('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-i', '-', '-pix_fmt', 'yuvj444p', '-q:v', '2', nf], { input: png, stdio: ['pipe', 'inherit', 'inherit'] })
      if (existsSync(f) && sha(readFileSync(f)) !== sha(readFileSync(nf)) && sameImage(f, nf)) rmSync(nf)
      else renameSync(nf, f)
      man.plate[n] = sha(readFileSync(f))
    }
    if (layers.has('cap')) {     // the caption alone on transparent
      await show(['stage', 'floor'], false); await show(['cap'], true)
      await page.evaluate(() => { const f = document.getElementById('frame'); f.dataset.bg = f.style.background; f.dataset.bgi = f.style.backgroundImage; f.style.background = 'none'
        for (const el of f.children) if (el.id !== 'cap') el.dataset.d = el.style.display, el.style.display = 'none'
        document.documentElement.style.background = document.body.style.background = 'transparent' })
      await settle()
      const f = join(dir, 'cap', tag + '.png')
      const big = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } })
      run('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-i', '-', '-vf', `format=gbrap,premultiply=inplace=1,scale=${W}:${H}:flags=area,unpremultiply=inplace=1,format=rgba`, '-frames:v', '1', f], { input: big, stdio: ['pipe', 'inherit', 'inherit'], maxBuffer: 1 << 28 })
      man.cap[n] = sha(readFileSync(f))
      await page.evaluate(() => { const f = document.getElementById('frame'); f.style.background = f.dataset.bg; f.style.backgroundImage = f.dataset.bgi
        for (const el of f.children) if (el.id !== 'cap') el.style.display = el.dataset.d || '' })
    }
    if (layers.has('face')) {    // the card laid flat at SCALE x, caption hidden; the pose is recorded with it
      await show(['stage', 'floor', 'cap'], true); await show(['cap'], false)
      states[n] = await page.evaluate(() => { const s = { ...window.cardState }, card = document.getElementById('card'), stage = document.getElementById('stage')
        stage.style.perspective = 'none'; Object.assign(card.style, { left: '0px', top: '0px', transform: 'none' }); return s })
      await settle()
      const png = await page.screenshot({ type: 'png', clip: { x: 12, y: 12, width: SW, height: SH, scale: 1 } })
      const f = join(dir, 'face', tag + '.jpg'), nf = f + '.new.jpg', h = sha(png)
      if (h === prevFace) copyFileSync(prevFaceFile, nf)       // held frames are identical: skip the encode
      else run('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-i', '-', '-pix_fmt', 'yuvj444p', '-q:v', String(CFG.face.q), nf], { input: png, stdio: ['pipe', 'inherit', 'inherit'] })
      if (existsSync(f) && sha(readFileSync(f)) !== sha(readFileSync(nf)) && sameImage(f, nf)) rmSync(nf)   // same picture: keep the cached file
      else renameSync(nf, f)
      prevFace = h; prevFaceFile = f
      man.face[n] = sha(readFileSync(f))
      await page.evaluate(() => { document.getElementById('stage').style.perspective = '' }); await show(['cap'], true)
    }
    if (k % 30 === 0) process.stdout.write(`\r  export ${k}/${list.length}  ${Math.round((Date.now() - t0) / 1000)}s`)
  }
  await browser.close(); await pbrowser?.close()
  man.frames = Math.max(man.frames || 0, offset + list.length); man.total = total; man.fps = FPS; man.chrome = CHROME
  writeFileSync(manifestFile, JSON.stringify(man))
  if (layers.has('face')) writeFileSync(join(dir, 'states.json'), JSON.stringify({ fps: FPS, frames: man.frames, screen: [SW, SH], pad: 12, bottom: 908, origin: 540, floor: 990, states: states.slice(0, man.frames) }))
  console.log(`\n  exported ${list.length} frames [${[...layers]}] -> ${dir}`)
  return { total }
}

function checkExport(dir, n) {
  const states = readJson(join(dir, 'states.json'), null)
  if (!states) fail('no states.json: run export first')
  if (states.states.length !== n || states.frames !== n) fail(`states has ${states.states.length} frames, expected ${n}`)
  for (const l of ['face', 'bgseq', 'cap']) { const c = readdirSync(join(dir, l)).length; if (c < n) fail(`${l}: ${c} files, expected ${n}`) }
  const [fw, fh] = jpegSize(join(dir, 'face', frameName(1) + '.jpg'))
  if (fw !== SW * SCALE || fh !== SH * SCALE) fail(`face is ${fw}x${fh}, config needs ${SW * SCALE}x${SH * SCALE}`)
  const [pw, ph] = jpegSize(join(dir, 'bgseq', frameName(1) + '.jpg'))
  if (pw !== W * CFG.plate.scale || ph !== H * CFG.plate.scale) fail(`plate is ${pw}x${ph}, config needs ${W * CFG.plate.scale}x${H * CFG.plate.scale}`)
  // a tile-drop would leave a face far smaller than its neighbours
  const sizes = readdirSync(join(dir, 'face')).sort().map(f => readFileSync(join(dir, 'face', f)).length)
  for (let i = 1; i < sizes.length - 1; i++) { const nb = Math.min(sizes[i - 1], sizes[i + 1]); if (sizes[i] < nb * 0.5) fail(`face ${i + 1} is ${Math.round(100 * sizes[i] / nb)}% of its neighbours: likely a dropped tile, re-export`) }
}

// ------------------------------------------------------------------ render (Blender), cached by content key
const cfgHash = () => sha(JSON.stringify([CFG.res, CFG.face, CFG.render]) + sha(readFileSync(BUILD_PY)))
function cardKeys(dir, n) {
  const man = readJson(join(dir, 'manifest.json'), null), st = readJson(join(dir, 'states.json'), null)
  if (!man || !st) fail('nothing exported yet: run export first')
  const ch = cfgHash(), round = s => JSON.stringify(s, (k, v) => typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)
  return Array.from({ length: n }, (_, i) => sha([ch, man.face[i], man.plate[i], round(st.states[i]), round(st.states[Math.min(i + 1, n - 1)])].join('|')))
}

function renderFrames(dir, keys, outDir, frames) {
  mkdirSync(outDir, { recursive: true })
  const todo = frames.filter(f => !existsSync(join(outDir, keys[f - 1] + '.png')))
  console.log(`  render: ${todo.length} of ${frames.length} frames need Blender (${frames.length - todo.length} cached)`)
  if (!todo.length) return
  const eff = join(BUILD, 'render.config.json'); writeFileSync(eff, JSON.stringify(CFG))
  const list = join(BUILD, 'todo.txt'); writeFileSync(list, todo.map(f => `${f} ${keys[f - 1]}`).join('\n'))
  run(BLENDER, ['-b', '-P', BUILD_PY, '--', '--frames-file', list, outDir], { env: { ...process.env, SHIFT_CONFIG: eff, SHIFT_CACHE: dir, SHIFT_LOOK: CFG.render.look }, stdio: ['inherit', 'ignore', 'inherit'] })
  const sc = readJson(join(outDir, 'sidecar.json'), {})
  if (sc.look !== CFG.render.look || sc.samples !== CFG.render.samples || sc.view !== 'Standard' || sc.res?.[0] !== W) fail('Blender rendered with different settings than the config: ' + JSON.stringify(sc))
}

// ------------------------------------------------------------------ composite + encode
function encode(dir, keys, outFile, n, from = 1) {
  const seq = join(BUILD, 'out', 'cardseq'); rmSync(seq, { recursive: true, force: true }); mkdirSync(seq, { recursive: true })
  keys.slice(from - 1, n).forEach((k, i) => { const f = join(BUILD, 'cards', k + '.png'); if (!existsSync(f)) fail('frame ' + (from + i) + ' is not rendered: run render'); symlinkSync(f, join(seq, frameName(i + 1) + '.png')) })
  const { crf, preset } = CFG.encode
  run('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(seq, '%04d.png'), '-framerate', String(FPS), '-start_number', String(from), '-i', join(dir, 'cap', '%04d.png'),
    '-filter_complex', `[0][1]overlay=format=auto,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p`,
    '-c:v', 'libx264', '-preset', preset, '-crf', String(crf), '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-frames:v', String(n - from + 1), '-movflags', '+faststart', '-an', outFile])
  console.log(`  wrote ${outFile}`)
}

// ------------------------------------------------------------------ gate: the same look/sharpness as the approved film
async function gate() {
  const dir = join(BUILD, 'gate'); rmSync(join(dir, 'face'), { recursive: true, force: true })
  const frames = CFG.gate.pairs.flatMap(p => { const f = Math.round(p.t * FPS); return [f, f + 1] })   // pair: motion blur samples the next pose
  await exportLayers(frames, dir, new Set(['face', 'plate']))
  const n = frames.length, keys = cardKeys(dir, n), cards = join(BUILD, 'cards-gate')
  renderFrames(dir, keys, cards, CFG.gate.pairs.map((_, i) => 2 * i + 1))
  const ref = resolve(HERE, CFG.gate.reference), outs = []
  CFG.gate.pairs.forEach((p, i) => {
    const a = join(BUILD, `gate-${p.name}-ref.png`), b = join(cards, keys[2 * i] + '.png'), o = join(BUILD, `gate-${p.name}.png`)
    run('ffmpeg', ['-v', 'error', '-y', '-ss', String(p.refT), '-i', ref, '-frames:v', '1', '-vf', `scale=${W}:${H}`, a])
    run('ffmpeg', ['-v', 'error', '-y', '-i', a, '-i', b, '-filter_complex', '[0]scale=960:-1[x];[1]scale=960:-1[y];[x][y]hstack', '-frames:v', '1', o]); outs.push(o)
  })
  const sheet = join(BUILD, 'gate.png')
  run('ffmpeg', ['-v', 'error', '-y', ...outs.flatMap(o => ['-i', o]), '-filter_complex', outs.map((_, i) => `[${i}]`).join('') + `vstack=${outs.length}`, '-frames:v', '1', sheet])
  console.log('\n  gate sheet (left: approved site film, right: this render): ' + sheet)
}

// ------------------------------------------------------------------ proof: full composites of chosen moments, before a full render
async function proof(times) {
  const dir = join(BUILD, 'proof'); rmSync(dir, { recursive: true, force: true })
  const frames = times.flatMap(t => { const f = Math.round(t * FPS); return [f, f + 1] })
  await exportLayers(frames, dir, new Set(['face', 'plate', 'cap']))
  const n = frames.length, keys = cardKeys(dir, n), cards = join(BUILD, 'cards-proof')
  renderFrames(dir, keys, cards, times.map((_, i) => 2 * i + 1))
  times.forEach((t, i) => {
    const o = join(BUILD, `proof-${t}.png`)
    run('ffmpeg', ['-v', 'error', '-y', '-i', join(cards, keys[2 * i] + '.png'), '-i', join(dir, 'cap', frameName(2 * i + 1) + '.png'), '-filter_complex', '[0][1]overlay=format=auto', '-frames:v', '1', o])
    console.log('  proof: ' + o)
  })
}

// ------------------------------------------------------------------ environment: the page server starts itself
let server = null
async function ensureServer() {
  const up = async () => { try { return (await fetch(PAGE)).ok } catch { return false } }
  if (await up()) return
  server = spawn('python3', ['-m', 'http.server', '8932'], { cwd: resolve(HERE, '../../..'), stdio: 'ignore' })
  process.on('exit', () => server?.kill())
  for (let i = 0; i < 50 && !(await up()); i++) await new Promise(r => setTimeout(r, 200))
  if (!(await up())) fail('could not serve ' + PAGE)
}
function doctor() {
  const ok = (c, m) => { console.log(`  ${c ? '✓' : '✗'} ${m}`); return c }
  const has = c => spawnSync(c, ['-version'], { stdio: 'ignore' }).status === 0
  const checks = [ok(existsSync(BLENDER), 'Blender: ' + BLENDER), ok(has('ffmpeg'), 'ffmpeg on PATH'), ok(existsSync(CHROME), 'Chrome: ' + CHROME),
    ok(existsSync(join(HERE, 'node_modules/puppeteer-core')), 'puppeteer-core installed (run npm i in film/)'),
    ok(existsSync(resolve(HERE, '../blender/hdri', CFG.render.env + '_2k.exr')), 'HDRI ' + CFG.render.env), ok(existsSync(resolve(HERE, CFG.source)), 'source ' + CFG.source),
    ok(existsSync(resolve(HERE, CFG.gate.reference)), 'gate reference film')]
  if (checks.includes(false)) process.exit(1)
  console.log('  ready')
}

// determinism: re-export a spread of frames and compare with the cache. Same source must give the same bytes.
async function verify() {
  const man = readJson(join(SEQ, 'manifest.json'), null), st = readJson(join(SEQ, 'states.json'), null)
  if (!man) fail('nothing exported yet')
  const dir = join(BUILD, 'verify'); rmSync(dir, { recursive: true, force: true })
  const sample = Array.from({ length: 12 }, (_, i) => Math.round(i * (man.frames - 1) / 11))
  await exportLayers(sample, dir, new Set(['face', 'plate', 'cap']))
  const v = readJson(join(dir, 'manifest.json')), vs = readJson(join(dir, 'states.json')), r = o => JSON.stringify(o, (k, x) => typeof x === 'number' ? Math.round(x * 1e4) / 1e4 : x)
  let bad = 0
  const file = (root, l, n) => join(root, l === 'plate' ? 'bgseq' : l, frameName(n + 1) + (l === 'cap' ? '.png' : '.jpg'))
  let dither = 0   // captions are composited fresh on every encode, never part of a render key; the gradient edge dithers differently per run
  sample.forEach((f, k) => { for (const l of ['face', 'plate', 'cap']) if (v[l][k] !== man[l][f] && !sameImage(file(dir, l, k), file(SEQ, l, f))) { if (l === 'cap') dither++; else { bad++; console.log(`  ✗ frame ${f + 1} ${l} differs`) } }
    if (r(vs.states[k]) !== r(st.states[f])) { bad++; console.log(`  ✗ frame ${f + 1} pose differs`) } })
  if (bad) fail(`${bad} differences: the export is not repeatable`)
  console.log(`  ✓ ${sample.length} sampled frames match the cache (face and plate within ${CFG.tolerance} luma levels, pose exact)` + (dither ? `; ${dither} caption frame(s) differ only in gradient dither (not rendered)` : ''))
}

// ------------------------------------------------------------------ commands
if (['export', 'all', 'captions', 'gate', 'verify'].includes(cmd)) await ensureServer()
mkdirSync(join(BUILD, 'seq'), { recursive: true })
const SEQ = join(BUILD, 'seq'), OUT = join(BUILD, 'out')
mkdirSync(OUT, { recursive: true })
const range = () => { const r = flag('frames'); if (!r || r === true) return null; const [a, b] = r.split('-').map(Number); return [a, b] }
const allFrames = async layers => { const total = await probeTotal(); const r = range(); const list = Array.from({ length: (r ? r[1] : total) - (r ? r[0] : 0) }, (_, i) => i + (r ? r[0] : 0)); return exportLayers(list, SEQ, layers, r ? r[0] : 0) }
async function probeTotal() {
  const { default: puppeteer } = await import(process.env.PPTR ? 'file://' + join(process.env.PPTR, 'lib/esm/puppeteer/puppeteer-core.js') : 'puppeteer-core')
  const b = await puppeteer.launch({ executablePath: CHROME, headless: true }); const p = await b.newPage(); await p.goto(PAGE); await p.evaluate(() => window.ready)
  const t = Math.round(await p.evaluate(() => window.DURATION) * FPS); await b.close(); return t
}
const film = DRAFT ? 'film-draft.mp4' : 'film.mp4'
const manFrames = () => readJson(join(SEQ, 'manifest.json'), { frames: 0 }).frames

if (cmd === 'export') { const l = flag('layers'); await allFrames(new Set(l && l !== true ? l.split(',') : ['face', 'plate', 'cap'])) }
else if (cmd === 'render') { const n = manFrames(); checkExport(SEQ, n); const k = cardKeys(SEQ, n); renderFrames(SEQ, k, join(BUILD, 'cards'), Array.from({ length: n }, (_, i) => i + 1)) }
else if (cmd === 'prune') {   // delete cached card frames that no frame of the current film uses
  const n = manFrames(), keep = new Set(cardKeys(SEQ, n).map(k => k + '.png')), dir = join(BUILD, 'cards')
  const old = readdirSync(dir).filter(f => f.endsWith('.png') && !keep.has(f))
  for (const f of old) rmSync(join(dir, f))
  console.log(`  prune: removed ${old.length} old card frames, kept ${keep.size}`)
}
else if (cmd === 'encode') { const n = manFrames(); checkExport(SEQ, n); encode(SEQ, cardKeys(SEQ, n), join(OUT, film), n) }
else if (cmd === 'captions') { await allFrames(new Set(['cap'])); const n = manFrames(); checkExport(SEQ, n); encode(SEQ, cardKeys(SEQ, n), join(OUT, film), n) }
else if (cmd === 'all') {
  await allFrames(new Set(['face', 'plate', 'cap'])); const n = manFrames(); checkExport(SEQ, n)
  const k = cardKeys(SEQ, n); renderFrames(SEQ, k, join(BUILD, 'cards'), Array.from({ length: n }, (_, i) => i + 1)); encode(SEQ, k, join(OUT, film), n)
}
else if (cmd === 'clip') {   // full-quality render of a section: clip --from 3 --to 7 (seconds) -> out/clip-<from>-<to>.mp4
  const a = Math.round(Number(flag('from')) * FPS) + 1, b = Math.round(Number(flag('to')) * FPS), n = manFrames(); checkExport(SEQ, n)
  const k = cardKeys(SEQ, n); renderFrames(SEQ, k, join(BUILD, 'cards'), Array.from({ length: b - a + 1 }, (_, i) => a + i)); encode(SEQ, k, join(OUT, `clip-${flag('from')}-${flag('to')}.mp4`), b, a)
}
else if (cmd === 'gate') await gate()
else if (cmd === 'proof') await proof((flag('t') || '').split(',').map(Number))
else if (cmd === 'doctor') doctor()
else if (cmd === 'verify') await verify()
else if (cmd === 'status') {
  const n = manFrames()
  if (!n) { console.log('nothing exported yet'); process.exit(0) }
  const k = cardKeys(SEQ, n), cached = k.filter(x => existsSync(join(BUILD, 'cards', x + '.png'))).length
  console.log(`frames ${n}, config ${cfgHash()} (${CFG.render.look}, ${CFG.render.samples} samples, face ${SCALE}x), rendered ${cached}/${n}, to render ${n - cached}`)
} else fail('unknown command: ' + cmd)
