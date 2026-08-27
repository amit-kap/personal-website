/* Markdown -> structured data. This runs at BUILD time (see the `virtual:cv`
   plugin in vite.config.ts), never in the browser, which is the whole point:
   it keeps unified/remark/mdast — about 95 kB gzipped — out of the bundle.

   Keep this file free of Vite-only syntax (import.meta.glob, ?raw imports) so
   the config can import it directly under Node. Images are deliberately not
   resolved here; content.ts attaches them at runtime, because only Vite knows
   the fingerprinted asset URLs. */
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { toString as mdastToString } from 'mdast-util-to-string'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfmToMarkdown } from 'mdast-util-gfm'
import type { Root, RootContent, Heading, Link, Paragraph, List } from 'mdast'
import { parse as parseYaml } from 'yaml'

export interface CVHeader {
  name: string
  tagline: string
  contacts: string // raw paragraph text (markdown), rendered by the page
}

export interface CVNamedEntry {
  title: string
  meta: string
}

export interface CVSkillGroup {
  category: string
  items: string[]
}

/** A CV experience entry before content.ts attaches its images. */
export interface ParsedExperience {
  slug: string
  company: string
  role: string
  period: string
  summary: string // first paragraph of body, plain text
}

export interface ParsedCV {
  header: CVHeader
  experience: ParsedExperience[]
  certificates: CVNamedEntry[]
  education: CVNamedEntry[]
  skills: CVSkillGroup[]
}

function splitByDepth(nodes: RootContent[], depth: 2 | 3): Array<{ heading: Heading; body: RootContent[] }> {
  const entries: Array<{ heading: Heading; body: RootContent[] }> = []
  let current: { heading: Heading; body: RootContent[] } | null = null
  for (const node of nodes) {
    if (node.type === 'heading' && node.depth === depth) {
      if (current) entries.push(current)
      current = { heading: node, body: [] }
    } else if (current) {
      current.body.push(node)
    }
  }
  if (current) entries.push(current)
  return entries
}

function nodesToMarkdown(nodes: RootContent[]): string {
  if (nodes.length === 0) return ''
  const root: Root = { type: 'root', children: nodes }
  return toMarkdown(root, { extensions: [gfmToMarkdown()] }).trim()
}

export function parseCv(raw: string): ParsedCV {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(raw) as Root
  const children = tree.children

  // Header: h1 + preamble paragraphs (until the first h2)
  let name = ''
  let tagline = ''
  let contacts = ''
  let i = 0
  for (; i < children.length; i++) {
    const node = children[i]
    if (node.type === 'heading' && node.depth === 2) break
    if (node.type === 'heading' && node.depth === 1) {
      name = mdastToString(node)
    } else if (node.type === 'paragraph') {
      if (!tagline) tagline = nodesToMarkdown([node])
      else if (!contacts) contacts = nodesToMarkdown([node])
    }
  }

  // Group remaining content by h2 sections, keyed by lowercased title.
  const sections = new Map<string, RootContent[]>()
  let currentKey = ''
  for (; i < children.length; i++) {
    const node = children[i]
    if (node.type === 'heading' && node.depth === 2) {
      currentKey = mdastToString(node).toLowerCase()
      sections.set(currentKey, [])
    } else if (currentKey) {
      sections.get(currentKey)!.push(node)
    }
  }

  const experience: ParsedExperience[] = []
  for (const entry of splitByDepth(sections.get('experience') ?? [], 3)) {
    const link = entry.heading.children.find((c): c is Link => c.type === 'link')
    if (!link) continue
    const slug = link.url.replace(/^\/experience\//, '').replace(/\/$/, '')
    const company = mdastToString(link)

    // First paragraph in the body = meta line: **Role** · Period
    let role = ''
    let period = ''
    const firstBody = entry.body[0]
    if (firstBody && firstBody.type === 'paragraph') {
      const meta = firstBody as Paragraph
      const strong = meta.children.find((c) => c.type === 'strong')
      role = strong ? mdastToString(strong) : ''
      const full = mdastToString(meta)
      period = full.slice(role.length).replace(/^[\s·]+/, '').trim()
    }

    const bodyNodes = entry.body.slice(1)
    const firstPara = bodyNodes.find((n) => n.type === 'paragraph')
    const summary = firstPara ? mdastToString(firstPara) : ''

    experience.push({ slug, company, role, period, summary })
  }

  // Cert / Education: h3 title + free-form body, flattened to plain meta
  const parseNamedEntries = (key: string): CVNamedEntry[] =>
    splitByDepth(sections.get(key) ?? [], 3).map((entry) => ({
      title: mdastToString(entry.heading),
      meta: entry.body.map((n) => mdastToString(n)).join(' ').trim(),
    }))

  // Skills: h3 category + list items
  const skills: CVSkillGroup[] = []
  for (const entry of splitByDepth(sections.get('skills') ?? [], 3)) {
    const list = entry.body.find((n): n is List => n.type === 'list')
    const items = list ? list.children.map((li) => mdastToString(li)) : []
    skills.push({ category: mdastToString(entry.heading), items })
  }

  return {
    header: { name, tagline, contacts },
    experience,
    certificates: parseNamedEntries('certificates'),
    education: parseNamedEntries('education'),
    skills,
  }
}

// ---- Front matter ----

function stripFrontMatter(raw: string): { frontMatter: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { frontMatter: {}, body: raw }
  const [, fmText, body] = match
  try {
    return { frontMatter: (parseYaml(fmText) ?? {}) as Record<string, unknown>, body }
  } catch {
    return { frontMatter: {}, body: raw }
  }
}

export interface ParsedWork {
  slug: string
  productTitle?: string
  blurb?: string
  order?: number
  hero?: string
  tileImage?: string
}

export function parseWorks(files: Record<string, string>): ParsedWork[] {
  return Object.entries(files).map(([slug, raw]) => {
    const fm = stripFrontMatter(raw).frontMatter as Omit<ParsedWork, 'slug'>
    return {
      slug,
      productTitle: fm.productTitle,
      blurb: fm.blurb,
      order: fm.order,
      hero: fm.hero,
      tileImage: fm.tileImage,
    }
  })
}

export interface ParsedCaseStudy {
  slug: string
  workSlug: string
  title: string
  excerpt: string
  featured: boolean
  cover?: string
  body: string
}

/** Folders without a `work` field are drafts and are dropped here. */
export function parseCaseStudies(files: Record<string, string>): ParsedCaseStudy[] {
  const out: ParsedCaseStudy[] = []
  for (const [slug, raw] of Object.entries(files)) {
    const { frontMatter, body } = stripFrontMatter(raw)
    const fm = frontMatter as { work?: string; excerpt?: string; featured?: boolean; cover?: string }
    if (!fm.work) continue
    const trimmed = body.trim()
    out.push({
      slug,
      workSlug: fm.work,
      title: trimmed.match(/^#\s+(.+?)\s*$/m)?.[1].trim() ?? '',
      excerpt: fm.excerpt ?? '',
      featured: fm.featured === true,
      cover: fm.cover,
      body: trimmed,
    })
  }
  return out
}
