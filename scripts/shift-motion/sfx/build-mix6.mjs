// Shift film mix v6: score take s11-a (ElevenLabs Music, 40.3 s, drop at 36.03 s), used as generated;
// generated UI sounds on every on-screen event, real typewriter keys, one whoosh (outro). Music ducks 4 dB under every event.
// Run: node build-mix6.mjs -> film-mix6.wav + ../film/build/out/film-mix6.mp4
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url)), SEQ = join(HERE, '../film/build/seq'), OUT = join(HERE, '../film/build/out')
const SR = 48000, FPS = 30, TAU = 2 * Math.PI
const man = JSON.parse(readFileSync(join(SEQ, 'manifest.json')))
const TOTAL = man.frames / FPS, N = Math.ceil(TOTAL * SR)
const DROP = 36.03                                                  // the drop lands on the outro flip

const ff = (args, opts = {}) => execFileSync('ffmpeg', ['-v', 'error', ...args], { maxBuffer: 1 << 29, ...opts })
const pcm = (f, filt = []) => {
  const b = ff(['-i', f.startsWith('/') ? f : join(HERE, f), ...(filt.length ? ['-af', filt.join(',')] : []), '-ac', '2', '-ar', String(SR), '-f', 's16le', '-'])
  const n = b.length / 4, L = new Float32Array(n), R = new Float32Array(n)
  for (let i = 0; i < n; i++) { L[i] = b.readInt16LE(i * 4) / 32768; R[i] = b.readInt16LE(i * 4 + 2) / 32768 }
  return [L, R]
}
const peakOf = c => { let p = 0; for (const ch of c) for (const v of ch) p = Math.max(p, Math.abs(v)); return p }
const norm = c => { const k = 1 / (peakOf(c) || 1); return c.map(ch => ch.map(v => v * k)) }
const db = x => Math.pow(10, x / 20)
const newBus = () => [new Float32Array(N), new Float32Array(N)]
let seed = 5; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
const put = (bus, src, at, gain, { rate = 1, fade = 0.005 } = {}) => {
  const n = Math.floor((src[0].length - 1) / rate), o = Math.round(at * SR), f = Math.max(1, Math.round(fade * SR))
  for (let i = 0; i < n; i++) {
    const j = o + i; if (j < 0 || j >= N) continue
    const p = i * rate, a = Math.floor(p), fr = p - a, g = gain * Math.min(1, i / f, (n - i) / f)
    bus[0][j] += (src[0][a] * (1 - fr) + src[0][a + 1] * fr) * g; bus[1][j] += (src[1][a] * (1 - fr) + src[1][a + 1] * fr) * g
  }
}

// ============================================================ MUSIC: ElevenLabs Music take s11-a, built from a plan whose drop starts at 36.03 s. Used as generated.
const src = pcm('score/s11-eleven-a.wav')
const music = newBus()
let rms = 0; for (let i = 0; i < Math.min(N, src[0].length); i++) rms += src[0][i] ** 2; rms = Math.sqrt(rms / Math.min(N, src[0].length))
const unit = db(-24) / rms
for (let i = 0; i < N && i < src[0].length; i++) { const g = unit * Math.min(1, i / (0.05 * SR)) * Math.min(1, (N - i) / (0.6 * SR)); music[0][i] = src[0][i] * g; music[1][i] = src[1][i] * g }

// ============================================================ FX
const fx = newBus()
const UI = n => norm(pcm('ui/' + n + '.wav'))
const S = { tick: UI('tick'), drop: UI('drop'), fall: UI('donut-b-scan'), warn: UI('warn'), pii: UI('pii'), ok: UI('connected'), slide: UI('slide') }
const LVL = { tick: -17, drop: -13, fall: -14, warn: -16, pii: -10, ok: -13, slide: -17 }   // dBFS peak per sound class
const events = []                                                                            // every event time, for ducking the music under it
const hit = (name, at, trim = 0, rate = 1) => { put(fx, S[name], at, db(LVL[name] + trim), { rate }); events.push(at) }

// the one whoosh: the outro flip
{ const w = norm(pcm('fal2/wL1.wav')); let pk = 0, pt = 0; for (let i = 0; i < w[0].length; i++) if (Math.abs(w[0][i]) > pk) { pk = Math.abs(w[0][i]); pt = i }
  put(fx, w, 36.03 + 0.25 - pt / SR, db(-18), { fade: 0.03 }) }

// typewriter: single keys cut from the keyboard recording (onsets by silence detection), as in the first mix
const TYPEF = 'dragon-studio-typing-keyboard-asmr-356116.mp3'
const typed = pcm(TYPEF)
const det = spawnSync('ffmpeg', ['-i', join(HERE, TYPEF), '-af', 'silencedetect=noise=-32dB:d=0.04', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
const onsets = [...det.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1]).filter(t => t > 0.2)
const KEYS = onsets.map(o => { const a = Math.round(Math.max(0, o - 0.004) * SR), n = Math.round(0.07 * SR); return norm([typed[0].slice(a, a + n), typed[1].slice(a, a + n)]) })
const key = (t, trim = 0) => put(fx, KEYS[Math.floor(rnd() * KEYS.length)], t, db(-19 + trim) * (0.8 + 0.4 * rnd()), { fade: 0.006 })
const empty = man.cap[0], runs = []; let s0 = null
man.cap.forEach((h, i) => { if (h !== empty && s0 === null) s0 = i; if (h === empty && s0 !== null) { runs.push(s0 / FPS); s0 = null } })
const CHARS = [57, 53, 37, 46, 29, 43]
runs.forEach((t0, c) => { for (let k = 0; k < CHARS[c]; k += 3) key(t0 + k / 75); events.push(t0 + 0.3) })
for (let k = 0; k < 5; k++) key(36.7 + k / 14, 2)
for (let k = 0; k < 14; k++) key(37.26 + k / 30, -1)

// on-screen events (absolute seconds)
hit('tick', 4.42); hit('tick', 4.50, -3, 1.08)                            // 01: Shadow Vendors 5 -> 6
hit('drop', 5.72)                                                         // 01: new finding drops in
hit('slide', 10.92)                                                       // 02: vendor card slides in
hit('fall', 12.35)                                                        // 03: score runs 74 -> 34 (digital readout)
hit('warn', 12.78, 0)                                                     // 03: grade B -> F
hit('warn', 13.16, -2, 0.84)                                              // 03: pill turns Critical
hit('pii', 18.10)                                                         // 04: Sites gains Customer PII
hit('drop', 23.15, -2); hit('slide', 23.2, -1)                            // 05: critical threat slides in on top
hit('ok', 28.90)                                                          // 06: Jira connected
for (let k = 0; k < 16; k++) hit('tick', 34.10 + k * 0.7 / 16, -3 + k * 0.25, 0.9 + k * 0.02)   // 07: New answers 4 -> 20
// mouse clicks: a synthesised click (normalised to a fixed peak) + a quieter release
const mkClick = () => { const n = Math.round(0.06 * SR), c = new Float32Array(n); let lp = 0, pk = 0
  for (let i = 0; i < n; i++) { const t = i / SR, r = rnd() * 2 - 1; lp += 0.35 * (r - lp); c[i] = (r - lp) * Math.exp(-t / 0.0022) * 0.9 + Math.sin(TAU * 1500 * t) * Math.exp(-t / 0.004) * 0.5 + Math.sin(TAU * 320 * t) * Math.exp(-t / 0.009) * 0.35; pk = Math.max(pk, Math.abs(c[i])) }
  return [c.map(v => v / pk), c.map(v => v / pk)] }
const CLICK = mkClick()
for (const t of [6.56, 10.65, 24.06, 28.45, 35.40]) { put(fx, CLICK, t, db(-12), { fade: 0.002 }); put(fx, CLICK, t + 0.07, db(-20), { fade: 0.002, rate: 1.1 }); events.push(t) }

// ============================================================ MIX: light ducking, then one loudness pass to -16 LUFS
const dg = new Float32Array(N).fill(1)                                      // music gain: -4 dB around every event (30 ms in, 350 ms out)
for (const te of events) for (let i = Math.max(0, Math.round((te - 0.03) * SR)); i < Math.min(N, Math.round((te + 0.45) * SR)); i++) { const u = i / SR - te, g = u < 0 ? 1 - 0.37 * (u + 0.03) / 0.03 : 0.63 + 0.37 * Math.min(1, Math.max(0, (u - 0.1) / 0.35)); if (i / SR < DROP) dg[i] = Math.min(dg[i], g) }
const out = newBus()
for (let i = 0; i < N; i++) { for (let c = 0; c < 2; c++) out[c][i] = music[c][i] * dg[i] + fx[c][i] }
const wav = (bus, gain) => {
  const data = Buffer.alloc(N * 4); for (let i = 0; i < N; i++) for (let c = 0; c < 2; c++) data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, Math.tanh(bus[c][i] * gain * 0.9) / 0.9)) * 32767), i * 4 + c * 2)
  const h = Buffer.alloc(44); h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVEfmt ', 8); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22)
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40); return Buffer.concat([h, data])
}
const tmp = join(HERE, '.mix6-raw.wav'); writeFileSync(tmp, wav(out, 1))
const m = execFileSync('ffmpeg', ['-hide_banner', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
const lufs = parseFloat((m || '').match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)?.[0])
const spawn = spawnSync('ffmpeg', ['-hide_banner', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' })
const I = parseFloat([...spawn.stderr.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop()[1])
const gain = db(-16 - I)
writeFileSync(join(HERE, 'film-mix6.wav'), wav(out, gain))
ff(['-y', '-i', join(OUT, 'film.mp4'), '-i', join(HERE, 'film-mix6.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(TOTAL), join(OUT, 'film-mix6.mp4')])
console.log(`raw ${I} LUFS -> gain ${(20 * Math.log10(gain)).toFixed(1)} dB  -> ${join(OUT, 'film-mix6.mp4')}`)
