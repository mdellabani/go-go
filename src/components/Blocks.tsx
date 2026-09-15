import type { Block } from '#/content/types'
import GoRunner from './GoRunner'

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'p':
            return (
              <p key={i} className="max-w-3xl text-base leading-relaxed text-[var(--sea-ink-soft)]">
                {b.text}
              </p>
            )
          case 'ul':
            return (
              <ul key={i} className="max-w-3xl list-disc space-y-2 pl-5 text-[var(--sea-ink-soft)]">
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            )
          case 'code':
            return (
              <figure key={i} className="island-shell overflow-hidden rounded-2xl">
                {b.caption ? (
                  <figcaption className="border-b border-[var(--line)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--kicker)]">
                    {b.caption}
                  </figcaption>
                ) : null}
                <pre className="overflow-x-auto px-4 py-3 text-sm leading-relaxed">
                  <code>{b.code}</code>
                </pre>
              </figure>
            )
          case 'table':
            return (
              <div key={i} className="island-shell overflow-x-auto rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)]">
                      {b.head.map((h) => (
                        <th key={h} className="px-4 py-2 font-semibold text-[var(--sea-ink)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row) => (
                      <tr key={row.join()} className="border-b border-[var(--line)] last:border-0">
                        {row.map((cell) => (
                          <td key={cell} className="px-4 py-2 align-top text-[var(--sea-ink-soft)]">
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
              <section key={i} className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--kicker)]">
                  {b.snippet.title}
                </h3>
                <GoRunner code={b.snippet.code} hint={b.snippet.hint} />
              </section>
            )
        }
      })}
    </div>
  )
}
