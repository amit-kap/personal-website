// One-time, in-place compression of content rasters.
// Caps width at 2400px, quality ~80, keeps formats & filenames. GIFs untouched.
// Prints any file whose pixel dimensions changed so the hardcoded
// imageDimensionsByPath table in src/lib/content.ts can be updated.
//
// Requires sharp as a temporary dev dependency:
//   npm install -D sharp && node scripts/compress-images.mjs && npm uninstall sharp
import { globSync, statSync, renameSync } from 'node:fs'
import sharp from 'sharp'

const MAX_WIDTH = 2400
const MIN_BYTES = 300 * 1024 // leave already-small files alone

const files = globSync('src/content/**/*.{png,jpg,jpeg,webp}')
let saved = 0

for (const file of files) {
  const before = statSync(file).size
  if (before < MIN_BYTES) continue

  const img = sharp(file)
  const meta = await img.metadata()
  const resized = img.resize({ width: MAX_WIDTH, withoutEnlargement: true })

  let pipeline
  if (file.endsWith('.png')) pipeline = resized.png({ quality: 80, compressionLevel: 9, palette: true })
  else if (file.endsWith('.webp')) pipeline = resized.webp({ quality: 80 })
  else pipeline = resized.jpeg({ quality: 80, mozjpeg: true })

  const tmp = `${file}.tmp`
  const info = await pipeline.toFile(tmp)
  const after = statSync(tmp).size

  if (after < before) {
    renameSync(tmp, file)
    saved += before - after
    const resizedDown = meta.width > MAX_WIDTH
    console.log(
      `${file}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB` +
        (resizedDown ? `  DIMENSIONS CHANGED: ${meta.width}x${meta.height} → ${info.width}x${info.height}` : ''),
    )
  } else {
    const { unlinkSync } = await import('node:fs')
    unlinkSync(tmp)
  }
}

console.log(`\nTotal saved: ${(saved / 1024 / 1024).toFixed(1)}MB`)
