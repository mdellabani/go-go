import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { SearchSchemaInput } from '@tanstack/react-router'
import { translation, type Row } from '#/content/translation'

const CATEGORIES = ['all', 'syntax', 'types', 'concurrency', 'tooling', 'structure'] as const
type Category = (typeof CATEGORIES)[number]

const SORTS = ['none', 'java', 'rust', 'go'] as const
type Sort = (typeof SORTS)[number]

// Output type: always fully populated, so components never handle undefined.
type Search = { q: string; cat: Category; sort: Sort }
// Input type: every field optional, so <Link to="/table" /> needs no search prop.
type SearchInput = { q?: string; cat?: Category; sort?: Sort }

export const Route = createFileRoute('/table')({
  // SearchSchemaInput brands the parameter as the INPUT type. Without it the router
  // derives the input from the return type and demands every field on every <Link>.
  validateSearch: (raw: SearchInput & SearchSchemaInput): Search => ({
    q: typeof raw.q === 'string' ? raw.q : '',
    cat: CATEGORIES.includes(raw.cat as Category) ? (raw.cat as Category) : 'all',
    sort: SORTS.includes(raw.sort as Sort) ? (raw.sort as Sort) : 'none',
  }),
  head: () => ({ meta: [{ title: 'Java · Rust · Go translation table — go-go' }] }),
  component: TablePage,
})

function matches(row: Row, q: string) {
  const needle = q.toLowerCase()
  return (
    row.java.toLowerCase().includes(needle) ||
    row.rust.toLowerCase().includes(needle) ||
    row.go.toLowerCase().includes(needle) ||
    row.note.toLowerCase().includes(needle)
  )
}

const COLS = [
  { key: 'java', label: 'Java', tag: 'tag-java' },
  { key: 'rust', label: 'Rust', tag: 'tag-rust' },
  { key: 'go', label: 'Go', tag: 'tag-go' },
] as const

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
    <main className="page-wrap px-4 pb-16 pt-8">
      <p className="kicker mb-2">reference</p>
      <h1 className="display mb-3 text-2xl text-[var(--ink)] sm:text-[2rem]">
        Java · Rust · Go
      </h1>
      <p className="mb-6 max-w-2xl text-[0.95rem] leading-[1.7] text-[var(--ink-dim)]">
        The same idea in three languages. Filter state lives in the URL and is validated by the
        route, so this view is bookmarkable and survives a refresh — copy the address bar after
        filtering.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setSearch({ q: e.target.value })}
          placeholder="filter…"
          className="mono min-w-44 flex-1 rounded-lg border-2 border-[var(--line-hard)] bg-[var(--surface)] px-3 py-2 text-[0.8125rem] text-[var(--ink)] outline-none placeholder:text-[var(--ink-dim)] focus:border-[var(--accent)]"
        />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSearch({ cat: c })}
            className={c === cat ? 'btn btn-go' : 'btn btn-ghost'}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="panel overflow-x-auto rounded-lg">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-[var(--line-hard)] bg-[var(--foam)]">
              {COLS.map((col) => (
                <th key={col.key} className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSearch({ sort: sort === col.key ? 'none' : col.key })}
                    className={`tag ${col.tag} cursor-pointer`}
                  >
                    {col.label} {sort === col.key ? '↑' : ''}
                  </button>
                </th>
              ))}
              <th className="kicker px-3 py-2.5">note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.go + r.java} className="border-b border-[var(--line)] last:border-0">
                <td className="mono px-3 py-2.5 align-top text-[0.75rem] text-[var(--ink-dim)]">
                  {r.java}
                </td>
                <td className="mono px-3 py-2.5 align-top text-[0.75rem] text-[var(--ink-dim)]">
                  {r.rust}
                </td>
                <td className="mono px-3 py-2.5 align-top text-[0.75rem] font-semibold text-[var(--ink)]">
                  {r.go}
                </td>
                <td className="px-3 py-2.5 align-top text-[0.8125rem] text-[var(--ink-dim)]">
                  {r.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="kicker mt-4">
        {rows.length} of {translation.length} rows
      </p>
    </main>
  )
}
