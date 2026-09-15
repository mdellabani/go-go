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

## Conventions

- All note content lives in `src/content/sections.ts`. Add a section there and to the
  `sectionIds` array in `vite.config.ts` so it gets prerendered.
- Every snippet must compile. `pnpm verify:snippets` runs in CI and fails the build otherwise.
- Search params are validated in the route and branded with `SearchSchemaInput` so `<Link>`
  does not require them. See `src/routes/table.tsx`.
- TanStack Table was deliberately not used — v9 rewrote the API and the tables here are
  static. Revisit only if a table needs real sorting/pagination/virtualization.
