/* Builds the downloadable CV (public/<CV_PDF_NAME>) from src/content/cv.md:
   renders a one-page A4 sheet as HTML and prints it with headless Chrome.
   Run with `npm run cv:pdf` after editing cv.md. */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const pdfName = readFileSync(join(root, 'src/lib/cvPdf.ts'), 'utf8').match(/CV_PDF_NAME = '([^']+)'/)[1]

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/* Inline markdown: links and bold only, which is all cv.md uses. */
const inline = (text) =>
  escape(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
/* "10/2024 to 10/2026" reads as "10/2024–10/2026"; "to now" as "–Present". */
const period = (text) => text.replace(' to now', '–Present').replace(' to ', '–')

/* cv.md: "# Name", a bold tagline, the contacts line, the intro, then "## "
   sections of "### " entries. */
function parseCv(markdown) {
  const [head, ...sections] = markdown.split(/^## /m)
  const headLines = head.split('\n').map((l) => l.trim()).filter(Boolean)
  const cv = {
    name: headLines[0].replace(/^# /, ''),
    tagline: headLines[1].replace(/\*\*/g, ''),
    contacts: headLines[2],
    intro: headLines.slice(3).join(' '),
    sections: {},
  }
  for (const section of sections) {
    const [title, ...rest] = section.split('\n')
    cv.sections[title.trim()] = rest
      .join('\n')
      .split(/^### /m)
      .slice(1)
      .map((entry) => {
        const [heading, ...lines] = entry.split('\n').map((l) => l.trim()).filter(Boolean)
        return {
          title: heading.replace(/\[([^\]]+)\]\([^)]+\)/, '$1'),
          meta: lines.filter((l) => !l.startsWith('- ')),
          items: lines.filter((l) => l.startsWith('- ')).map((l) => l.slice(2)),
        }
      })
  }
  return cv
}

function experienceEntry({ title, meta, items }) {
  // "**Role** · period · context"
  const [role, when, context] = meta[0].split(' · ')
  return `<article class="entry">
    <h3>${escape(title)} | ${inline(role)}</h3>
    <p class="meta">${escape(period(when))} · ${escape(context ?? '')}</p>
    ${items.map((item) => `<p class="body">${inline(item)}</p>`).join('\n    ')}
  </article>`
}

const sideEntry = ({ title, meta }) =>
  `<div class="side-entry"><p class="side-title">${escape(title)}</p><p class="meta">${escape(period(meta.join(' ')))}</p></div>`

function render(cv) {
  const skills = cv.sections.Skills ?? []
  const skillBlock = ({ title, items }) =>
    title === 'Tools'
      ? `<h2>${escape(title)}</h2><p class="list">${items.map(escape).join(', ')}</p>`
      : `<h2>${escape(title)}</h2>${items.map((i) => `<p class="list">${escape(i)}</p>`).join('')}`
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escape(cv.name)} CV</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&display=block">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Geist', system-ui, sans-serif; color: #111; width: 210mm; padding: 14mm 15mm 10mm; font-size: 10.5px; line-height: 1.5; }
  a { color: inherit; text-decoration: underline; text-decoration-color: #c9c9c4; text-underline-offset: 2px; }
  .name { font-size: 30px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.15; }
  .tagline { margin-top: 6px; font-size: 12px; }
  .contacts { margin-top: 12px; font-size: 9px; color: #5c5c58; }
  .intro { margin-top: 18px; padding-top: 16px; border-top: 1px solid #e6e6e6; font-size: 12px; line-height: 1.6; color: #333330; }
  .grid { margin-top: 22px; display: grid; grid-template-columns: 1fr 32%; gap: 32px; }
  h2 { font-size: 8px; font-weight: 400; letter-spacing: 0.2em; text-transform: uppercase; color: #8a8a85; margin: 0 0 10px; }
  .side h2 { margin-top: 20px; }
  .side h2:first-child { margin-top: 0; }
  .entry { margin-bottom: 16px; }
  h3 { font-size: 12.5px; font-weight: 500; line-height: 1.35; }
  .meta { margin-top: 2px; font-size: 9px; color: #7b7b76; }
  .body { margin-top: 5px; color: #5c5c58; }
  .side-entry { margin-bottom: 11px; }
  .side-title { font-size: 12px; font-weight: 500; line-height: 1.35; }
  .list { color: #333330; line-height: 1.75; }
</style></head>
<body>
  <h1 class="name">${escape(cv.name)}</h1>
  <p class="tagline">${escape(cv.tagline)}</p>
  <p class="contacts">${inline(cv.contacts)}</p>
  <p class="intro">${inline(cv.intro)}</p>
  <div class="grid">
    <section><h2>Experience</h2>${(cv.sections.Experience ?? []).map(experienceEntry).join('\n')}</section>
    <aside class="side">
      <h2>Certificates</h2>${(cv.sections.Certificates ?? []).map(sideEntry).join('')}
      <h2>Education</h2>${(cv.sections.Education ?? []).map(sideEntry).join('')}
      ${skills.map(skillBlock).join('\n')}
    </aside>
  </div>
</body></html>`
}

const html = render(parseCv(readFileSync(join(root, 'src/content/cv.md'), 'utf8')))
const dir = mkdtempSync(join(tmpdir(), 'cv-'))
const htmlPath = join(dir, 'cv.html')
writeFileSync(htmlPath, html)
const out = join(root, 'public', pdfName)
execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-pdf-header-footer', '--virtual-time-budget=5000', `--print-to-pdf=${out}`, htmlPath], { stdio: 'ignore' })
console.log(`Wrote public/${pdfName}`)
