import type { Block } from '#/content/types'
import GoRunner from './GoRunner'

const ASIDE_LABEL = {
  java: 'if you know Java',
  rust: 'if you know Rust',
  warn: 'watch out',
} as const

const ASIDE_COLOR = {
  java: 'var(--warm)',
  rust: 'var(--hot)',
  warn: 'var(--accent)',
} as const

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'p':
            return (
              <p key={i} className="text-[0.975rem] leading-[1.75] text-[var(--ink-dim)]">
                {b.text}
              </p>
            )

          case 'ul':
            return (
              <ul key={i} className="space-y-2.5">
                {b.items.map((it) => (
                  <li key={it} className="flex gap-3 text-[0.975rem] leading-[1.7] text-[var(--ink-dim)]">
                    <span className="mono mt-px flex-none text-[var(--accent)]">→</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )

          case 'code':
            return (
              <figure key={i} className="panel overflow-hidden rounded-lg">
                {b.caption ? (
                  <figcaption className="kicker border-b-2 border-[var(--line-hard)] bg-[var(--foam)] px-3 py-2">
                    {b.caption}
                  </figcaption>
                ) : null}
                <pre className="overflow-x-auto px-4 py-3.5 text-[0.8125rem] leading-[1.65] text-[var(--ink)]">
                  <code>{b.code}</code>
                </pre>
              </figure>
            )

          case 'aside':
            return (
              <aside
                key={i}
                className="rounded-lg border-l-4 bg-[var(--foam)] py-3 pl-4 pr-4"
                style={{ borderColor: ASIDE_COLOR[b.tone] }}
              >
                <span
                  className="kicker mb-1 block"
                  style={{ color: ASIDE_COLOR[b.tone] }}
                >
                  {ASIDE_LABEL[b.tone]}
                </span>
                <p className="m-0 text-[0.925rem] leading-[1.7] text-[var(--ink-dim)]">{b.text}</p>
              </aside>
            )

          case 'compare':
            return (
              <div key={i} className="space-y-2">
                {b.caption ? <p className="kicker">{b.caption}</p> : null}
                <div className="panel overflow-x-auto rounded-lg">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr className="border-b-2 border-[var(--line-hard)] bg-[var(--foam)]">
                        <th className="px-3 py-2">
                          <span className="tag tag-java">Java</span>
                        </th>
                        <th className="px-3 py-2">
                          <span className="tag tag-rust">Rust</span>
                        </th>
                        <th className="px-3 py-2">
                          <span className="tag tag-go">Go</span>
                        </th>
                        <th className="kicker px-3 py-2">note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r) => (
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
              </div>
            )

          case 'table':
            return (
              <div key={i} className="panel overflow-x-auto rounded-lg">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[var(--line-hard)] bg-[var(--foam)]">
                      {b.head.map((h) => (
                        <th key={h} className="kicker px-3 py-2">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row) => (
                      <tr key={row.join()} className="border-b border-[var(--line)] last:border-0">
                        {row.map((cell) => (
                          <td key={cell} className="px-3 py-2.5 align-top text-[var(--ink-dim)]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'run':
            return (
              <section key={b.snippet.id} className="space-y-2">
                <h3 className="mono flex items-center gap-2 text-[0.8125rem] font-bold text-[var(--ink)]">
                  <span className="text-[var(--accent)]">▶</span>
                  {b.snippet.title}
                </h3>
                {/* keyed by snippet id: the editor seeds state on mount, so without a
                    changing key React reuses the previous step's code */}
                <GoRunner key={b.snippet.id} code={b.snippet.code} hint={b.snippet.hint} />
              </section>
            )
        }
      })}
    </div>
  )
}
