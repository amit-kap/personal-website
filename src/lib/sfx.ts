/* Opt-in sound for the Work with me journey. Off on every visit until the
   visitor turns it on; that click is also the gesture browsers require
   before Web Audio may play. Files load only once sound is on. */
import { useSyncExternalStore } from 'react'

export type Sound = 'dock' | 'ignite' | 'do' | 're' | 'mi'

const SOURCES: Record<Sound, string> = {
  dock: '/sfx/journey-dock.mp3',
  ignite: '/sfx/journey-ignite.mp3',
  do: '/sfx/journey-do.mp3',
  re: '/sfx/journey-re.mp3',
  mi: '/sfx/journey-mi.mp3',
}
const VOLUME: Record<Sound, number> = { dock: 0.35, ignite: 0.6, do: 0.3, re: 0.3, mi: 0.3 }
/* The ignite file swells for this long before its chord, so the journey
   starts it early to land the chord on the package filling. */
export const IGNITE_LEAD = 0.3
const SWOOSH_VOLUME = 0.22
// A fast fling crosses several stops at once; one blip covers them.
const MIN_GAP_MS = 120

let enabled = false
let context: AudioContext | null = null
const buffers = new Map<Sound, Promise<AudioBuffer | null>>()
const lastPlayed = new Map<Sound, number>()
const listeners = new Set<() => void>()
let swoosh: { gain: GainNode; filter: BiquadFilterNode; level: number } | null = null

function load(ctx: AudioContext, name: Sound) {
  let buffer = buffers.get(name)
  if (!buffer) {
    buffer = fetch(SOURCES[name])
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => null)
    buffers.set(name, buffer)
  }
  return buffer
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (on && typeof AudioContext !== 'undefined') {
    context ??= new AudioContext()
    void context.resume()
    for (const name of Object.keys(SOURCES) as Sound[]) void load(context, name)
  }
  if (!on) setSwoosh(0)
  listeners.forEach((listener) => listener())
}

export function playSound(name: Sound) {
  const ctx = context
  if (!enabled || !ctx) return
  const now = performance.now()
  if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return
  lastPlayed.set(name, now)
  void load(ctx, name).then((buffer) => {
    if (!buffer || !enabled) return
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    gain.gain.value = VOLUME[name]
    source.buffer = buffer
    source.connect(gain).connect(ctx.destination)
    source.start()
  })
}

export function useSoundEnabled() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => enabled,
    () => false,
  )
}

/* The disc's travel noise: looping noise through a band-pass, generated
   here rather than loaded. Louder and brighter the faster the disc moves. */
function startSwoosh(ctx: AudioContext) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.8
  filter.frequency.value = 400
  const gain = ctx.createGain()
  gain.gain.value = 0
  source.connect(filter).connect(gain).connect(ctx.destination)
  source.start()
  return { gain, filter, level: 0 }
}

/* level: 0 (still) to 1 (a fast fling). */
export function setSwoosh(level: number) {
  const ctx = context
  const target = enabled ? Math.max(0, Math.min(1, level)) : 0
  if (!ctx || (!swoosh && target === 0)) return
  swoosh ??= startSwoosh(ctx)
  if (Math.abs(target - swoosh.level) < 0.01) return
  swoosh.level = target
  const now = ctx.currentTime
  swoosh.gain.gain.cancelScheduledValues(now)
  swoosh.gain.gain.setTargetAtTime(target ** 1.5 * SWOOSH_VOLUME, now, 0.06)
  swoosh.filter.frequency.cancelScheduledValues(now)
  swoosh.filter.frequency.setTargetAtTime(400 + target * 1600, now, 0.08)
}
