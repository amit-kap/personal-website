/* Each company's mark, from src/content/experience/<slug>/icon.svg. Used by
   the home page's Recent Work tiles and the About page's experience rows. */
const logoModules = import.meta.glob<string>('../content/experience/*/icon.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

export function logoFor(slug: string): string | undefined {
  return logoModules[`../content/experience/${slug}/icon.svg`]
}
