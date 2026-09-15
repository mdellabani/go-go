import { useState } from 'react'
import type { Challenge } from '#/content/types'
import GoRunner from './GoRunner'

export default function ChallengeBox({ challenge }: { challenge: Challenge }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <section className="panel rounded-lg border-l-[6px] border-l-[var(--warm)] p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="kicker" style={{ color: 'var(--warm)' }}>
          ✎ your turn
        </span>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="btn btn-ghost ml-auto"
        >
          {revealed ? '← back to the stub' : 'show solution'}
        </button>
      </div>

      <p className="mb-4 max-w-2xl text-[0.95rem] leading-[1.7] text-[var(--ink)]">
        {challenge.prompt}
      </p>

      <div className="mb-4">
        <span className="kicker mb-1.5 block">it should print</span>
        <pre className="mono overflow-x-auto rounded border border-[var(--line)] bg-[var(--foam)] px-3 py-2 text-[0.75rem] leading-[1.6] text-[var(--ink-dim)]">
          <code>{challenge.expected}</code>
        </pre>
      </div>

      {/* keyed so toggling swaps the editor contents instead of reusing stale state */}
      <GoRunner
        key={revealed ? 'solution' : 'starter'}
        code={revealed ? challenge.solution : challenge.starter}
        hint={
          revealed
            ? 'This is one working answer, not the only one. Compare it with what you wrote.'
            : 'Edit the code, then Run (Ctrl/Cmd+Enter). It compiles as-is — it just does the wrong thing.'
        }
      />
    </section>
  )
}
