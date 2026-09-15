import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import Blocks from '#/components/Blocks'
import { sections } from '#/content/sections'

export const Route = createFileRoute('/notes/$sectionId')({
  loader: ({ params }) => {
    const section = sections.find((s) => s.id === params.sectionId)
    if (!section) throw notFound()
    return { section }
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.section.title} — go-go reference` }] : [],
  }),
  component: SectionPage,
  notFoundComponent: () => (
    <main className="page-wrap px-4 py-16">
      <h1 className="display text-2xl">404 — no such section</h1>
      <Link to="/" className="nav-link mt-4 inline-flex">
        back to start
      </Link>
    </main>
  ),
})

function SectionPage() {
  const { section } = Route.useLoaderData()
  const idx = sections.findIndex((s) => s.id === section.id)
  const prev = sections[idx - 1]
  const next = sections[idx + 1]

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="mb-8 flex flex-wrap items-center gap-1.5">
        <Link to="/" className="kicker mr-2 no-underline hover:text-[var(--ink)]">
          reference
        </Link>
        {sections.map((s, i) => (
          <Link
            key={s.id}
            to="/notes/$sectionId"
            params={{ sectionId: s.id }}
            title={s.title}
            className={`pill ${i === idx ? 'pill-now' : ''}`}
          >
            <span className="pill-n">{s.n}</span>
            {s.nav ?? s.title}
          </Link>
        ))}
      </div>

      <article className="rise-in">
        <h1 className="display mb-3 max-w-3xl text-2xl leading-tight text-[var(--ink)] sm:text-[2rem]">
          {section.title}
        </h1>
        <p className="mb-9 max-w-2xl text-base leading-[1.7] text-[var(--ink-dim)]">
          {section.blurb}
        </p>

        <Blocks blocks={section.blocks} />
      </article>

      <nav className="mt-14 flex flex-col gap-3 border-t-2 border-[var(--line-hard)] pt-6 sm:flex-row sm:items-center">
        {prev ? (
          <Link to="/notes/$sectionId" params={{ sectionId: prev.id }} className="btn btn-ghost">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/notes/$sectionId" params={{ sectionId: next.id }} className="btn sm:ml-auto">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </main>
  )
}
