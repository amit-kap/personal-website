/* Sound for the Work with me journey, off until asked for. Glaze's outline
   Toggle at its small size, in Glaze's smallest type (micro; written as a
   length so Glaze's class merge doesn't take it for a colour and drop it).
   The speaker lights in the primary while on.
   Shown only where the journey animates: 900px and up, without reduced
   motion. */
import { Toggle } from '@amit-kap/glaze/components/toggle'
import { setSoundEnabled, useSoundEnabled } from '@/lib/sfx'

/* Lucide's "volume-2" and "volume-x". */
function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg data-icon="inline-start" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="group-aria-pressed/toggle:text-primary">
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      {on ? (
        <>
          <path d="M16 9a5 5 0 0 1 0 6" />
          <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
        </>
      ) : (
        <>
          <path d="m22 9-6 6" />
          <path d="m16 9 6 6" />
        </>
      )}
    </svg>
  )
}

export function SoundToggle({ className = '' }: { className?: string }) {
  const on = useSoundEnabled()
  return (
    <Toggle
      variant="outline"
      size="sm"
      pressed={on}
      onPressedChange={setSoundEnabled}
      className={`hidden text-[length:var(--text-micro)] text-muted-foreground aria-pressed:text-foreground min-[900px]:inline-flex motion-reduce:hidden ${className}`}
    >
      <SoundIcon on={on} />
      {on ? 'Sound on' : 'Sound off'}
    </Toggle>
  )
}
