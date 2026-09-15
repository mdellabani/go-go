# Go notes

Go explained for a Java developer, with every example editable and compiled by the real
Go toolchain. Eleven sections, a Java→Go translation table, and a scratch playground.

Deployed to GitHub Pages. Static — there is no application server.

## Why there is a Cloudflare Worker

`go.dev` sends `frame-ancestors 'self'` (so the playground cannot be iframed) and no CORS
headers on `/_/compile` (so the browser cannot call it directly). `worker/index.ts` is a
~60-line proxy that forwards `{ code }` to the playground and adds the CORS headers back.
Everything else is static files.

## Setup

```sh
pnpm install
pnpm worker:dev          # terminal 1 — runner proxy on :8787
pnpm dev                 # terminal 2 — site on :3000
```

### Deploying the runner (once)

```sh
npx wrangler login
pnpm worker:deploy       # prints https://go-notes-playground.<subdomain>.workers.dev
```

Then add the URL to the repo so CI can bake it in:

```sh
gh variable set GO_RUNNER_URL --body "https://go-notes-playground.<subdomain>.workers.dev"
```

Add your Pages origin to `ALLOWED_ORIGIN` in `worker/index.ts` if it is not `*.github.io`.

### Deploying the site

Push to `main`. The workflow typechecks, verifies every snippet still compiles, builds with
`BASE_PATH=/<repo>/`, and publishes `.output/public`. Enable Pages → Source: GitHub Actions
once, in repo settings.

## Scripts

| script | what |
|---|---|
| `pnpm dev` | dev server |
| `pnpm build` | static build into `.output/public` (+ `404.html`, `.nojekyll`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm verify:snippets` | compiles every runnable snippet against go.dev, fails on error |
| `pnpm worker:dev` / `worker:deploy` | the runner proxy |

## Layout

```
src/content/sections.ts   all note content + runnable snippets  <- edit this
src/content/translation.ts Java→Go table rows
src/components/GoRunner.tsx CodeMirror + run button
src/routes/notes.$sectionId.tsx  typed path param
src/routes/table.tsx      typed + validated search params
src/routes/playground.tsx program lives in the URL
worker/index.ts           CORS proxy to the Go playground
```

## TanStack bits worth reading

- `notes.$sectionId.tsx` — typed path params, a route `loader`, `notFound()`.
- `table.tsx` — `validateSearch` with a `SearchSchemaInput`-branded input type. Without the
  brand the router derives the input from the *output* and demands every param on every
  `<Link>`. Filter state is in the URL, so the view is shareable and survives a refresh.
- `GoRunner.tsx` — TanStack Query `useMutation` for the run call.
