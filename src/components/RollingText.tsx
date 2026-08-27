/* Rolling-letter label (the source site's signature hover): each character is
   a column of two stacked copies inside an overflow-hidden line. When a
   `.roll-host` ancestor is hovered, the columns roll up with a small stagger. */
export default function RollingText({ text }: { text: string }) {
  return (
    <>
      <span className="roll" aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <span key={i} className="roll-ch" style={{ '--roll-d': `${i * 0.018}s` } as React.CSSProperties}>
            <span>{ch}</span>
            <span>{ch}</span>
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </>
  )
}
