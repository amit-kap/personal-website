import { defineConfig, type Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'path'
import { parseCv, parseWorks, parseCaseStudies } from './src/lib/parseContent'

const CONTENT_DIR = path.resolve(__dirname, 'src/content')

/* Parses every markdown source here, at build time, and hands the app plain
   JSON. Doing it in the browser pulled unified + remark + mdast + yaml into
   the entry chunk, where every page paid for a parser it could not use.
   Images stay out of this — only Vite knows their fingerprinted URLs, so
   content.ts attaches them at runtime. */
function contentPlugin(): Plugin {
  const id = 'virtual:content'
  const resolved = '\0' + id

  const readFolders = (group: 'experience' | 'writing', file: string) => {
    const base = path.join(CONTENT_DIR, group)
    const out: Record<string, string> = {}
    for (const slug of fs.readdirSync(base)) {
      const full = path.join(base, slug, file)
      if (fs.existsSync(full)) out[slug] = fs.readFileSync(full, 'utf8')
    }
    return out
  }

  return {
    name: 'content-data',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(moduleId) {
      if (moduleId !== resolved) return
      const data = {
        cv: parseCv(fs.readFileSync(path.join(CONTENT_DIR, 'cv.md'), 'utf8')),
        works: parseWorks(readFolders('experience', 'work.md')),
        caseStudies: parseCaseStudies(readFolders('writing', 'index.md')),
      }
      return `export default ${JSON.stringify(data)}`
    },
    // Editing markdown in dev should refresh the page, not just the graph.
    handleHotUpdate({ file, server }) {
      if (!file.startsWith(CONTENT_DIR) || !file.endsWith('.md')) return
      const mod = server.moduleGraph.getModuleById(resolved)
      if (mod) server.moduleGraph.invalidateModule(mod)
      server.ws.send({ type: 'full-reload' })
    },
  }
}

/* Dev only: links the titles animation preview to the site. The preview page (docs/AS_hero/current/
   titles-preview.html) is served at /__titles/preview, and every slider change is written to
   src/lib/titlesAnimation.json, which Home reads. So the preview and the page share one set of values. */
function titlesAnimationPlugin(): Plugin {
  const jsonFile = path.resolve(__dirname, 'src/lib/titlesAnimation.json')
  const previewFile = path.resolve(__dirname, 'docs/AS_hero/current/titles-preview.html')
  const limits: Record<string, [number, number]> = {
    gap: [0, 3], fade: [0, 5], move: [0, 5], push: [0, 10], lineOffset: [0, 3],
    nudgeAfter: [0, 30], nudgeDistance: [0, 10], nudgeLength: [0.05, 5], nudgeBackLength: [0.05, 5], nudgeHold: [0, 30], nudgeLineDelay: [0, 3],
    discoStep: [0.02, 2], discoIn: [0, 1], discoOut: [0, 2], discoCount: [1, 6],
  }
  return {
    name: 'titles-animation-link',
    apply: 'serve',
    // The entrance only plays on load, so a saved change reloads the page to replay the whole movie.
    handleHotUpdate({ file, server }) {
      if (file !== jsonFile) return
      server.ws.send({ type: 'full-reload' })
      return []
    },
    configureServer(server) {
      server.middlewares.use('/__titles', (req, res) => {
        const url = req.url ?? ''
        if (req.method === 'GET' && url.startsWith('/preview')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.end(fs.readFileSync(previewFile, 'utf8'))
          return
        }
        if (url.startsWith('/config')) {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            res.end(fs.readFileSync(jsonFile, 'utf8'))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk) => (body += chunk))
            req.on('end', () => {
              try {
                const input = JSON.parse(body) as Record<string, unknown>
                const out: Record<string, number> = {}
                for (const [key, [lo, hi]] of Object.entries(limits)) {
                  const value = Number(input[key])
                  if (!Number.isFinite(value) || value < lo || value > hi) throw new Error(`bad ${key}`)
                  out[key] = value
                }
                fs.writeFileSync(jsonFile, JSON.stringify(out, null, 2) + '\n')
                res.statusCode = 204
                res.end()
              } catch {
                res.statusCode = 400
                res.end('bad values')
              }
            })
            return
          }
        }
        res.statusCode = 404
        res.end()
      })
    },
  }
}

/* Dev only: the ?tune mode on the work pages saves a tile's placement straight into its page. POST /__tile with
   { page, kind, key, x, y, z } rewrites (or adds) the x, y and z on that tile's line in src/pages/<Page>.tsx. */
function tileTunePlugin(): Plugin {
  const pages: Record<string, string> = { shift: 'ShiftPage.tsx', veriti: 'VeritiPage.tsx', checkpoint: 'CheckPointPage.tsx' }
  return {
    name: 'tile-tune',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__tile', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 404
          res.end()
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', () => {
          try {
            const { page, kind, key, x, y, z } = JSON.parse(body) as { page: string; kind: string; key: string; x: number; y: number; z: number }
            const name = pages[page]
            if (!name || !['file', 'video', 'brand'].includes(kind) || ![x, y, z].every(Number.isFinite) || !/^[\w./-]+$/.test(key)) throw new Error('bad input')
            const target = path.resolve(__dirname, 'src/pages', name)
            const lines = fs.readFileSync(target, 'utf8').split('\n')
            const token = `${kind}: '${key}'`
            const i = lines.findIndex((l) => l.includes(token))
            if (i < 0) throw new Error('tile not found')
            const xyz = /x: [\d.-]+, y: [\d.-]+, z: [\d.-]+/
            lines[i] = xyz.test(lines[i]) ? lines[i].replace(xyz, `x: ${x}, y: ${y}, z: ${z}`) : lines[i].replace(token, `${token}, x: ${x}, y: ${y}, z: ${z}`)
            fs.writeFileSync(target, lines.join('\n'))
            res.statusCode = 204
            res.end()
          } catch (e) {
            res.statusCode = 400
            res.end(String((e as Error).message))
          }
        })
      })
    },
  }
}

export default defineConfig({
  // Cloudflare Pages serves from the domain root, so dev and build agree.
  base: '/',
  plugins: [react(), tailwindcss(), contentPlugin(), titlesAnimationPlugin(), tileTunePlugin()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5175,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/**', 'media-archive/**'],
  },
})
