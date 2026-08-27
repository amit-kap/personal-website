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

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/personal-website/',
  plugins: [react(), tailwindcss(), contentPlugin()],
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
  },
}))
