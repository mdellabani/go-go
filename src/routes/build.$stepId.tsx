import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import Blocks from '#/components/Blocks'
import ChallengeBox from '#/components/ChallengeBox'
import { track } from '#/content/track'
import { exercises } from '#/content/exercises'

export const Route = createFileRoute('/build/$stepId')({
  loader: ({ params }) => {
    const step = track.find((s) => s.id === params.stepId)
    if (!step) throw notFound()
    return { step }
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.step.n}. ${loaderData.step.title} — go-go` }] : [],
  }),
  component: StepPage,
  notFoundComponent: () => (
    <main className="page-wrap px-4 py-16">
      <h1 className="display text-2xl">404 — no such step</h1>
      <Link to="/" className="nav-link mt-4 inline-flex">
        back to start
      </Link>
    </main>
  ),
})

function StepPage() {
  const { step } = Route.useLoaderData()
  const idx = track.findIndex((s) => s.id === step.id)
  const prev = track[idx - 1]
  const next = track[idx + 1]
  const pct = ((idx + 1) / track.length) * 100
  const exercise = exercises[step.id]

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="mb-8 flex items-center gap-3">
        <Link to="/" className="kicker no-underline hover:text-[var(--ink)]">
          build a service
        </Link>
        <div className="rail flex-1">
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className="kicker">
          step {idx + 1}/{track.length}
        </span>
      </div>

      <div className="mb-8 flex flex-wrap gap-1.5">
        {track.map((s, i) => (
          <Link
            key={s.id}
            to="/build/$stepId"
            params={{ stepId: s.id }}
            title={`${s.n}. ${s.title}`}
            className={`pill ${i === idx ? 'pill-now' : i < idx ? 'pill-done' : ''}`}
          >
            <span className="pill-n">{s.n}</span>
            {s.nav ?? s.title}
          </Link>
        ))}
      </div>

      <article className="rise-in">
        <p className="kicker mb-2">step {String(step.n).padStart(2, '0')}</p>
        <h1 className="display mb-4 max-w-3xl text-2xl leading-tight text-[var(--ink)] sm:text-[2rem]">
          {step.title}
        </h1>

        <div className="panel mb-6 rounded-lg border-l-[6px] border-l-[var(--hot)] px-5 py-4">
          <span className="kicker mb-1.5 block" style={{ color: 'var(--hot)' }}>
            why you are here
          </span>
          <p className="m-0 text-[1.05rem] font-medium leading-[1.6] text-[var(--ink)]">
            {step.problem}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="kicker">this step forces</span>
          {step.learns.map((l) => (
            <span key={l} className="tag">
              {l}
            </span>
          ))}
        </div>

        {exercise ? (
          <div className="mb-9 flex flex-wrap items-center gap-2">
            <span className="kicker">go doc</span>
            {exercise.docs.map((d) => (
              <a
                key={d.label}
                href={d.href}
                target="_blank"
                rel="noreferrer"
                title={d.note}
                className="tag tag-go no-underline hover:bg-[var(--link-bg-hover)]"
              >
                {d.label} ↗
              </a>
            ))}
          </div>
        ) : null}

        <Blocks blocks={step.blocks} />

        {exercise ? (
          <div className="mt-10">
            <ChallengeBox challenge={exercise.challenge} />
          </div>
        ) : null}
      </article>

      <nav className="mt-14 flex flex-col gap-3 border-t-2 border-[var(--line-hard)] pt-6 sm:flex-row sm:items-center">
        {prev ? (
          <Link to="/build/$stepId" params={{ stepId: prev.id }} className="btn btn-ghost">
            ← {prev.n}. {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to="/build/$stepId" params={{ stepId: next.id }} className="btn btn-go sm:ml-auto">
            {next.n}. {next.title} →
          </Link>
        ) : (
          <Link to="/table" className="btn btn-go sm:ml-auto">
            Built it. Go to the reference →
          </Link>
        )}
      </nav>
    </main>
  )
}
