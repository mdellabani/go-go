import { Link, createFileRoute } from '@tanstack/react-router'
import { sections } from '#/content/sections'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="page-wrap px-4 pb-16 pt-12">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--hero-a),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--hero-b),transparent_66%)]" />
        <p className="island-kicker mb-3">Notes for a Java developer</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Go is C with a garbage collector, cheap threads, and a package manager.
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          No VM. No JIT. No classes, no inheritance, no exceptions. Eleven sections, every
          example editable and compiled by the real Go toolchain — break them and read the error.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/notes/$sectionId"
            params={{ sectionId: 'syntax' }}
            className="rounded-full bg-[var(--lagoon-deep)] px-5 py-2.5 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Start at the syntax →
          </Link>
          <Link
            to="/table"
            className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5"
          >
            Java → Go table
          </Link>
          <Link
            to="/playground"
            className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5"
          >
            Playground
          </Link>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s, i) => (
          <Link
            key={s.id}
            to="/notes/$sectionId"
            params={{ sectionId: s.id }}
            className="island-shell feature-card rise-in rounded-2xl p-5 no-underline transition hover:-translate-y-1"
            style={{ animationDelay: `${i * 50 + 60}ms` }}
          >
            <span className="island-kicker mb-1 block text-xs">{String(s.n).padStart(2, '0')}</span>
            <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">{s.title}</h2>
            <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{s.blurb}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
