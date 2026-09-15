import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

// GitHub Pages serves at /<repo>/ — CI sets BASE_PATH, dev stays at /
const base = process.env.BASE_PATH ?? '/'

const sectionIds = [
  'syntax',
  'methods',
  'interfaces',
  'closures',
  'errors',
  'memory',
  'concurrency',
  'defer',
  'packages',
  'debugging',
  'gotchas',
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
      pages: [
        { path: '/' },
        { path: '/table' },
        { path: '/playground' },
        ...sectionIds.map((id) => ({ path: `/notes/${id}` })),
      ],
      sitemap: { enabled: false },
    }),
    viteReact(),
  ],
})
