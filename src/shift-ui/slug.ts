/* "Brightwave Media Inc." → "brightwave-media-inc". Used for logo files and
   for widget ids. */
export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
