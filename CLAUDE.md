# go-go

Static learning site: Go explained for a Java developer, every snippet runnable.
Deployed to GitHub Pages; a Cloudflare Worker proxies code to the go.dev playground.

## Stack

TanStack Start (SPA mode + build-time prerender) · TanStack Router · TanStack Query ·
Vite 8 · React 19 · Tailwind 4 · CodeMirror 6 (`@codemirror/lang-go`) · Cloudflare Worker.

## Commands

```sh
pnpm dev                 # site on :3000
pnpm worker:dev          # runner proxy on :8787 (needed for Run buttons)
pnpm typecheck
pnpm verify:snippets     # compiles every snippet against the real Go toolchain
BASE_PATH=/go-go/ pnpm build
```

## Architecture notes

- **No server.** SPA mode + prerender; `.output/public` is the whole deployment.
  `404.html` (copy of `_shell.html`) is the SPA fallback GitHub Pages needs.
- **`BASE_PATH`** must end in a slash and is set by CI from the repo name. It feeds both
  Vite `base` and the router `basepath`.
- **The Worker is required** because go.dev sends no CORS headers and forbids iframing.
  `VITE_GO_RUNNER_URL` is baked in at build time; it defaults to `http://localhost:8787`.
- **`spa`/`prerender`/`pages` config shape** was read off the installed zod schema in
  `@tanstack/start-plugin-core/dist/esm/schema.js` — check there, not blog posts, when it moves.

## Content structure

Three tiers, deliberately ordered so there is one obvious starting point:

| Tier | Route | Source | What it is |
|---|---|---|---|
| Orientation | `/why/$questionId` | `src/content/orientation.ts` | 9 questions an experienced dev asks *before* syntax |
| Build | `/build/$stepId` | `src/content/track.ts` | 11 steps building one HTTP service |
| Reference | `/notes/$sectionId` | `src/content/sections.ts` | 11 deep dives, for lookup not reading |

Audience is senior engineers, not beginners. Comparisons use **Java and Rust columns**
(`kind: 'compare'` blocks and `src/content/translation.ts`) — never Java alone.

## Conventions

- Prerendered pages are **derived from the content** in `vite.config.ts`. Adding a question,
  step or section needs no second edit.
- Every snippet must compile. `pnpm verify:snippets` checks all three content files against the
  real Go toolchain and runs in CI.
- Build-track snippets drive handlers with `httptest.NewRecorder`. The playground sandbox has
  **no network**, so `httptest.NewServer` (a real socket) times out — verified, don't retry it.
- Search params are validated in the route and branded with `SearchSchemaInput` so `<Link>`
  does not require them. See `src/routes/table.tsx`.
- `head: ({ loaderData })` must guard on `loaderData` being undefined on first paint, or the
  tab title renders `undefined`.
- TanStack Table was deliberately not used — v9 rewrote the API and the tables here are
  static. Revisit only if a table needs real sorting/pagination/virtualization.

## Styling

Arcade-terminal: mono (`JetBrains Mono`) for all chrome and headings, Inter for prose,
graph-paper background, 2px borders with a hard offset shadow (no blur, no gradients).
Palette lives entirely in CSS vars in `src/styles.css` — `--ink`, `--ink-dim`, `--accent`,
`--hot`, `--warm`, `--line-hard`, `--foam`. Light and dark are both first-class; every var is
redefined under `[data-theme="dark"]` *and* under `prefers-color-scheme: dark`.
