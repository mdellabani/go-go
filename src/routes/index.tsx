import { Link, createFileRoute } from '@tanstack/react-router'
import { orientation } from '#/content/orientation'
import { track } from '#/content/track'
import { sections } from '#/content/sections'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="page-wrap px-4 pb-20 pt-10">
      <section className="rise-in mb-14">
        <p className="kicker prompt mb-4">go-go — Go for people who already ship software</p>
        <h1 className="display mb-5 max-w-4xl text-[1.75rem] leading-[1.15] text-[var(--ink)] sm:text-[2.75rem]">
          Go is C with a garbage collector, cheap threads,
          <br className="hidden sm:block" /> and a package manager
          <span className="blink" />
        </h1>
        <p className="mb-8 max-w-2xl text-base leading-[1.7] text-[var(--ink-dim)]">
          You already know how compilers, memory and threads work. This does not teach you
          programming again — it answers the questions you would actually ask, then has you build
          one real service. Every snippet is editable and compiled by the real Go toolchain.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/why/$questionId" params={{ questionId: 'jvm' }} className="btn btn-go">
            Start here ▸ 9 questions
          </Link>
          <Link to="/build/$stepId" params={{ stepId: 'serve' }} className="btn">
            Skip to building
          </Link>
        </div>
      </section>

      <div className="space-y-5">
        <Tier
          n="01"
          title="Orientation"
          tagline="What kind of language is this, before any syntax."
          meta={`${orientation.length} questions · no code required`}
          to={<Link to="/why/$questionId" params={{ questionId: 'jvm' }} className="btn btn-go">Start ▸</Link>}
          items={orientation.map((q) => ({
            key: q.id,
            label: q.q,
            to: (
              <Link
                key={q.id}
                to="/why/$questionId"
                params={{ questionId: q.id }}
                className="mono block rounded px-2 py-1.5 text-[0.8125rem] text-[var(--ink-dim)] no-underline hover:bg-[var(--link-bg-hover)] hover:text-[var(--ink)]"
              >
                <span className="mr-2 text-[var(--accent)]">{String(q.n).padStart(2, '0')}</span>
                {q.q}
              </Link>
            ),
          }))}
        />

        <Tier
          n="02"
          title="Build one service"
          tagline="An HTTP service, end to end. Each concept shows up because the program needs it."
          meta={`${track.length} steps · every step runnable`}
          to={<Link to="/build/$stepId" params={{ stepId: 'serve' }} className="btn btn-go">Build ▸</Link>}
          items={track.map((s) => ({
            key: s.id,
            label: s.title,
            to: (
              <Link
                key={s.id}
                to="/build/$stepId"
                params={{ stepId: s.id }}
                className="mono block rounded px-2 py-1.5 text-[0.8125rem] text-[var(--ink-dim)] no-underline hover:bg-[var(--link-bg-hover)] hover:text-[var(--ink)]"
              >
                <span className="mr-2 text-[var(--accent)]">{String(s.n).padStart(2, '0')}</span>
                {s.title}
              </Link>
            ),
          }))}
        />

        <Tier
          n="03"
          title="Reference"
          tagline="For looking things up once you are writing Go, not for reading front to back."
          meta={`${sections.length} deep dives · translation table · playground`}
          to={<Link to="/table" className="btn">Look up ▸</Link>}
          items={sections.map((s) => ({
            key: s.id,
            label: s.title,
            to: (
              <Link
                key={s.id}
                to="/notes/$sectionId"
                params={{ sectionId: s.id }}
                className="mono block rounded px-2 py-1.5 text-[0.8125rem] text-[var(--ink-dim)] no-underline hover:bg-[var(--link-bg-hover)] hover:text-[var(--ink)]"
              >
                <span className="mr-2 text-[var(--accent)]">{String(s.n).padStart(2, '0')}</span>
                {s.title}
              </Link>
            ),
          }))}
        />
      </div>
    </main>
  )
}

function Tier({
  n,
  title,
  tagline,
  meta,
  to,
  items,
}: {
  n: string
  title: string
  tagline: string
  meta: string
  to: React.ReactNode
  items: { key: string; label: string; to: React.ReactNode }[]
}) {
  return (
    <section className="panel rise-in rounded-xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start gap-4">
        <span className="display text-[2.5rem] leading-none text-[var(--accent)] opacity-40">
          {n}
        </span>
        <div className="min-w-56 flex-1">
          <h2 className="display m-0 mb-1.5 text-lg text-[var(--ink)]">{title}</h2>
          <p className="m-0 max-w-xl text-[0.9rem] leading-[1.6] text-[var(--ink-dim)]">{tagline}</p>
          <p className="kicker mt-2">{meta}</p>
        </div>
        <div className="ml-auto">{to}</div>
      </div>
      <div className="grid gap-x-4 border-t border-[var(--line)] pt-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => it.to)}
      </div>
    </section>
  )
}
