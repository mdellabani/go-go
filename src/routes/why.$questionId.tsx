import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import Blocks from '#/components/Blocks'
import { orientation } from '#/content/orientation'

export const Route = createFileRoute('/why/$questionId')({
  loader: ({ params }) => {
    const question = orientation.find((q) => q.id === params.questionId)
    if (!question) throw notFound()
    return { question }
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.question.q} — go-go` }] : [],
  }),
  component: QuestionPage,
  notFoundComponent: () => (
    <main className="page-wrap px-4 py-16">
      <h1 className="display text-2xl">404 — no such question</h1>
      <Link to="/" className="nav-link mt-4 inline-flex">
        back to start
      </Link>
    </main>
  ),
})

function QuestionPage() {
  const { question } = Route.useLoaderData()
  const idx = orientation.findIndex((q) => q.id === question.id)
  const prev = orientation[idx - 1]
  const next = orientation[idx + 1]
  const pct = ((idx + 1) / orientation.length) * 100

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <div className="mb-8 flex items-center gap-3">
        <Link to="/" className="kicker no-underline hover:text-[var(--ink)]">
          orientation
        </Link>
        <div className="rail flex-1">
          <span style={{ width: `${pct}%` }} />
        </div>
        <span className="kicker">
          {idx + 1}/{orientation.length}
        </span>
      </div>

      <div className="mb-8 flex flex-wrap gap-1.5">
        {orientation.map((q, i) => (
          <Link
            key={q.id}
            to="/why/$questionId"
            params={{ questionId: q.id }}
            title={q.q}
            className={`pill ${i === idx ? 'pill-now' : i < idx ? 'pill-done' : ''}`}
          >
            <span className="pill-n">{q.n}</span>
            {q.nav ?? q.q}
          </Link>
        ))}
      </div>

      <article className="rise-in">
        <h1 className="display mb-4 max-w-3xl text-2xl leading-tight text-[var(--ink)] sm:text-[2rem]">
          {question.q}
        </h1>

        <div className="panel mb-9 rounded-lg border-l-[6px] border-l-[var(--accent)] px-5 py-4">
          <span className="kicker mb-1.5 block">short answer</span>
          <p className="m-0 text-[1.05rem] font-medium leading-[1.6] text-[var(--ink)]">
            {question.short}
          </p>
        </div>

        <Blocks blocks={question.blocks} />
      </article>

      <nav className="mt-14 flex flex-col gap-3 border-t-2 border-[var(--line-hard)] pt-6 sm:flex-row sm:items-center">
        {prev ? (
          <Link to="/why/$questionId" params={{ questionId: prev.id }} className="btn btn-ghost">
            ← {prev.q}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/why/$questionId"
            params={{ questionId: next.id }}
            className="btn btn-go sm:ml-auto"
          >
            {next.q} →
          </Link>
        ) : (
          <Link to="/build/$stepId" params={{ stepId: 'serve' }} className="btn btn-go sm:ml-auto">
            Oriented. Now build something →
          </Link>
        )}
      </nav>
    </main>
  )
}
