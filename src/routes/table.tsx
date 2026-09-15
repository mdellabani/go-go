import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { SearchSchemaInput } from '@tanstack/react-router'
import { translation, type Row } from '#/content/translation'

const CATEGORIES = ['all', 'syntax', 'types', 'concurrency', 'tooling', 'structure'] as const
type Category = (typeof CATEGORIES)[number]

const SORTS = ['none', 'java', 'go'] as const
type Sort = (typeof SORTS)[number]

// Output type: always fully populated, so components never handle undefined.
type Search = { q: string; cat: Category; sort: Sort }
// Input type: every field optional, so <Link to="/table" /> needs no search prop.
type SearchInput = { q?: string; cat?: Category; sort?: Sort }

export const Route = createFileRoute('/table')({
  // Search params are validated here, so every consumer downstream is fully typed.
  // Link to="/table" search={{ cat: 'nope' }} is a COMPILE error.
  // SearchSchemaInput brands the parameter as the INPUT type. Without it the router
  // derives the input from the return type and demands every field on every <Link>.
  validateSearch: (raw: SearchInput & SearchSchemaInput): Search => ({
    q: typeof raw.q === 'string' ? raw.q : '',
    cat: CATEGORIES.includes(raw.cat as Category) ? (raw.cat as Category) : 'all',
    sort: SORTS.includes(raw.sort as Sort) ? (raw.sort as Sort) : 'none',
  }),
  head: () => ({ meta: [{ title: 'Java → Go translation table' }] }),
  component: TablePage,
})

function matches(row: Row, q: string) {
  const needle = q.toLowerCase()
  return (
    row.java.toLowerCase().includes(needle) ||
    row.go.toLowerCase().includes(needle) ||
    row.note.toLowerCase().includes(needle)
  )
}

function TablePage() {
  const { q, cat, sort } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const setSearch = (patch: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })

  const rows = translation
    .filter((r) => (cat === 'all' ? true : r.category === cat))
    .filter((r) => (q ? matches(r, q) : true))
    .toSorted((a, b) => (sort === 'none' ? 0 : a[sort].localeCompare(b[sort])))

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <p className="island-kicker mb-2">Reference</p>
      <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
        Java → Go
      </h1>
      <p className="mb-6 max-w-2xl text-[var(--sea-ink-soft)]">
        Filter state lives in the URL and is validated by the route, so this view is
        bookmarkable, shareable, and survives a refresh. Copy the address bar after filtering.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setSearch({ q: e.target.value })}
          placeholder="filter…"
          className="min-w-48 flex-1 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-2 text-sm text-[var(--sea-ink)] outline-none focus:border-[var(--lagoon-deep)]"
        />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSearch({ cat: c })}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              c === cat
                ? 'border-transparent bg-[var(--lagoon-deep)] text-white'
                : 'border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="island-shell overflow-x-auto rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--line)]">
              {(['java', 'go'] as const).map((col) => (
                <th key={col} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSearch({ sort: sort === col ? 'none' : col })}
                    className="font-semibold text-[var(--sea-ink)] hover:text-[var(--lagoon-deep)]"
                  >
                    {col === 'java' ? 'Java' : 'Go'} {sort === col ? '↑' : ''}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold text-[var(--sea-ink)]">note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.java} className="border-b border-[var(--line)] last:border-0">
                <td className="px-4 py-2 align-top font-mono text-xs text-[var(--sea-ink-soft)]">
                  {r.java}
                </td>
                <td className="px-4 py-2 align-top font-mono text-xs text-[var(--sea-ink)]">
                  {r.go}
                </td>
                <td className="px-4 py-2 align-top text-[var(--sea-ink-soft)]">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-[var(--sea-ink-soft)]">
        {rows.length} of {translation.length} rows
      </p>
    </main>
  )
}
