import { slugify } from '../slug'

/* Vendor logos are dropped into src/shift-ui/logos/ as <slug>.svg or .png
   (slug = lowercase name, non-letters to hyphens: "Brightwave Media Inc." →
   brightwave-media-inc). Without a file the vendor shows an initial tile. */
const files = import.meta.glob<string>('../logos/*.{svg,png,webp}', { eager: true, query: '?url', import: 'default' })

const bySlug = new Map(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url]),
)

export function VendorLogo({ name, size = 14 }: { name: string; size?: number }) {
  const url = bySlug.get(slugify(name))
  if (url) return <img src={url} alt="" width={size} height={size} style={{ objectFit: 'contain', flex: 'none' }} />
  return (
    <span className="s-logo-ph" style={{ width: size, height: size }}>
      {name[0]}
    </span>
  )
}
