/* Builds the Shift Assessments screen for the Agentic Assessments deck into one
   self-contained presentations/agentic-assessments/shift-ui/index.html.
   Run: node scripts/build-shift-embed.mjs */
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'presentations/agentic-assessments/shift-ui')
execFileSync('npx', ['vite', 'build', '-c', 'vite.shift-embed.config.ts'], { cwd: root, stdio: 'inherit' })

const assets = join(out, 'assets')
const read = (ext) => readFileSync(join(assets, readdirSync(assets).find((f) => f.endsWith(ext))), 'utf8')
const css = read('.css')
const js = read('.js').replace(/<\/script/gi, '<\\/script')
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shift Assessments</title>
<style>html,body,#root{margin:0;height:100%;background:#fdfdfd}</style>
<style>${css}</style>
</head><body><div id="root"></div><script>${js}</script></body></html>`
rmSync(assets, { recursive: true, force: true })
writeFileSync(join(out, 'index.html'), html)
console.log('shift-ui/index.html', (html.length / 1024).toFixed(0) + ' kB')
