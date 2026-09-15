import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { orientation } from './src/content/orientation'
import { track } from './src/content/track'
import { sections } from './src/content/sections'

// GitHub Pages serves at /<repo>/ — CI sets BASE_PATH, dev stays at /
const base = process.env.BASE_PATH ?? '/'

// Derived from the content itself so a new question/step/section is prerendered
// without anyone remembering to edit a list here.
const pages = [
  { path: '/' },
  { path: '/table' },
  { path: '/playground' },
  ...orientation.map((q) => ({ path: `/why/${q.id}` })),
  ...track.map((s) => ({ path: `/build/${s.id}` })),
  ...sections.map((s) => ({ path: `/notes/${s.id}` })),
]

export default defineConfig({
  base,
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart({
      router: { basepath: base },
      spa: { enabled: true },
      prerender: { enabled: true, autoSubfolderIndex: true, failOnError: false },
      pages,
      sitemap: { enabled: false },
    }),
    viteReact(),
  ],
})
