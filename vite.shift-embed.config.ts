import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/* Builds the Shift Assessments screen for the deck as one classic script with
   fonts and logos inlined, so scripts/build-shift-embed.mjs can fold it into a
   single HTML file that also opens from disk (file://). */
export default defineConfig({
  root: path.resolve(__dirname, 'presentations/agentic-assessments/shift-embed'),
  base: './',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') }, dedupe: ['react', 'react-dom'] },
  build: {
    outDir: path.resolve(__dirname, 'presentations/agentic-assessments/shift-ui'),
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { format: 'iife', inlineDynamicImports: true } },
  },
})
