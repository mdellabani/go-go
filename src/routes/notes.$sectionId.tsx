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
    meta: [{ title: `${loaderData?.section.title} — Go for Java devs` }],
  }),
  component: SectionPage,
  notFoundComponent: () => (
    <main className="page-wrap px-4 py-16">
      <h1 className="display-title text-3xl">No such section</h1>
      <Link to="/" className="nav-link">
        Back to the index
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
    <main className="page-wrap px-4 pb-16 pt-10">
      <p className="island-kicker mb-2">Section {section.n} of {sections.length}</p>
      <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
        {section.title}
      </h1>
      <p className="mb-8 max-w-2xl text-lg text-[var(--sea-ink-soft)]">{section.blurb}</p>

      <Blocks blocks={section.blocks} />

      <nav className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-sm font-semibold">
        {prev ? (
          <Link to="/notes/$sectionId" params={{ sectionId: prev.id }} className="nav-link">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/notes/$sectionId" params={{ sectionId: next.id }} className="nav-link ml-auto">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </main>
  )
}
