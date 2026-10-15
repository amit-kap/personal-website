import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
/* Home hero: availability pill, the title with its rotating words, and the
   supporting line. */
import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import StarBorder from '@/components/react-bits/StarBorder'
import { useAllowMotion } from '@/lib/useAllowMotion'
import { useTokenColor } from '@/lib/useTokenColor'

/* Which way a slot's words travel as they swap. */
type Push = 'up' | 'down' | 'right'

/* Each headline word maps to the words it rotates through (home.json). */
const rotation: Record<string, string[]> = homeCopy.headlineRotation
/* Words push in from a different side each: the headline is Senior / Product Designer. */
const pushFor: Record<string, Push> = { Senior: 'up', Product: 'down', Designer: 'right' }
/* Stagger order: top word, then left, then right. */
const orderFor: Record<string, number> = { Senior: 0, Product: 1, Designer: 2 }

/* One pulse moves the words on one after another (STAGGER_MS apart). Each
   word pushes and resizes its slot together over PUSH_MS, then everything
   holds for HOLD_MS. */
const PUSH_MS = 700
const STAGGER_MS = 700
const HOLD_MS = 3000
const PUSH_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/* Clip each slot only along its push axis, so a width change never cuts a
   vertically pushed word at the sides. */
const clipFor: Record<Push, string> = { up: 'inset(0 -100vw)', down: 'inset(0 -100vw)', right: 'inset(-100vh 0)' }

/* Counts rotations. Stays at 0 (the first word of each slot) when motion is
   not allowed. The page opens on "Senior Product Designer" and holds it for
   HOLD_MS; then it rotates once per full cycle: the last slot's start offset
   (2 staggers), its push, then the hold. The interval starts with the first
   rotation so the cycles never overlap. */
function usePulse(enabled: boolean) {
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (!enabled) return
    const advance = () => setPulse((count) => count + 1)
    let interval = 0
    const first = window.setTimeout(() => {
      advance()
      interval = window.setInterval(advance, PUSH_MS + 2 * STAGGER_MS + HOLD_MS)
    }, HOLD_MS)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(interval)
    }
  }, [enabled])
  return enabled ? pulse : 0
}

/* A word slot that pushes the old word out and the new one in while its
   width eases to the new word. The pushed layers span the whole slot, so a
   word always travels clear of it. */
function RotatingWord({ words, index, push, order }: { words: string[]; index: number; push: Push; order: number }) {
  const current = index % words.length
  const previous = index > 0 ? (index - 1) % words.length : null
  const wordSizers = useRef<(HTMLSpanElement | null)[]>([])
  const [widths, setWidths] = useState<number[]>([])

  // Every word's width, kept current as the type scale or font changes.
  useLayoutEffect(() => {
    const measure = () => setWidths(wordSizers.current.map((el) => el?.getBoundingClientRect().width ?? 0))
    measure()
    const observer = new ResizeObserver(measure)
    wordSizers.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [words])

  // Slots start one stagger apart, in `order`; the width change shares the push's delay.
  const delay = `${order * STAGGER_MS}ms`
  const motion = { animationDuration: `${PUSH_MS}ms`, animationDelay: delay, animationTimingFunction: PUSH_EASE }
  // The pushed words fill the whole slot, so they travel its full height or width.
  const layer = 'absolute inset-0 flex justify-center'

  return (
    <span
      className="hero-word relative inline-block whitespace-nowrap align-top transition-[width]"
      style={{
        width: widths[current] || undefined,
        clipPath: clipFor[push],
        ['--push-x' as string]: widths.length ? `${Math.max(...widths)}px` : undefined,
        transitionDuration: `${PUSH_MS}ms`,
        transitionDelay: delay,
        transitionTimingFunction: PUSH_EASE,
      }}
    >
      {/* Invisible copies: the current one gives the slot its height, the
          absolute ones are measured for widths. */}
      <span className="invisible inline-block">{words[current]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          ref={(el) => {
            wordSizers.current[i] = el
          }}
          aria-hidden="true"
          className="invisible absolute top-0 left-0 inline-block"
        >
          {word}
        </span>
      ))}
      {/* Remount on every rotation (the key) so the entrance animations restart. */}
      {previous !== null && (
        <span key={`out-${index}`} className={`${layer} push-out-${push}`} style={motion}>
          {words[previous]}
        </span>
      )}
      <span key={`in-${index}`} className={index > 0 ? `${layer} push-in-${push}` : layer} style={index > 0 ? motion : undefined}>
        {words[current]}
      </span>
    </span>
  )
}

export function Hero() {
  const pulse = usePulse(useAllowMotion())
  const starColor = useTokenColor('--primary')

  return (
    <section className="flex flex-col items-center px-6 py-20 text-center">
      <Reveal>
        {/* React Bits Star Border (Ember trail and glow): one star lapping the pill outline. */}
        <StarBorder
          as="div"
          color={starColor}
          duration={4.8}
          trailLength={0.45}
          glow={0.8}
          hover="brighten"
          radius={9999}
          backgroundColor="transparent"
          textColor="inherit"
          borderColor="var(--copy-border)"
          className="gap-4! px-6! py-2.25! font-normal! leading-normal!"
        >
          <span className="text-meta text-foreground">{homeCopy.availability}</span>
        </StarBorder>
      </Reveal>
      <Reveal as="h1" delay={0.08} className="mt-10 font-heading text-hero font-medium text-foreground">
        {/* Screen readers and search get the plain title; the rotating
            words are decoration. */}
        <span className="sr-only">{homeCopy.headlineLines.join(' ')}</span>
        {homeCopy.headlineLines.map((line) => (
          <span key={line} aria-hidden="true" className="block">
            {line.split(' ').map((word, i) => (
              <Fragment key={word}>
                {i > 0 && ' '}
                <RotatingWord
                  words={rotation[word] ?? [word]}
                  index={pulse}
                  push={pushFor[word] ?? 'up'}
                  order={orderFor[word] ?? 0}
                />
              </Fragment>
            ))}
          </span>
        ))}
      </Reveal>
      <Reveal as="p" delay={0.16} className="mt-6 w-full max-w-[568px] text-stmt text-muted-foreground">
        {homeCopy.supportingCopy}
      </Reveal>
    </section>
  )
}
