import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { SearchSchemaInput } from '@tanstack/react-router'
import GoRunner from '#/components/GoRunner'
import { sections } from '#/content/sections'

const DEFAULT = `package main

import "fmt"

func main() {
	fmt.Println("edit me, then hit Run (Ctrl/Cmd+Enter)")
}
`

const allSnippets = sections.flatMap((s) =>
  s.blocks.filter((b) => b.kind === 'run').map((b) => ({ section: s.title, ...b.snippet })),
)

function encode(src: string) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(src)))
}

function decode(raw: string) {
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)))
  } catch {
    return DEFAULT
  }
}

export const Route = createFileRoute('/playground')({
  validateSearch: (raw: { c?: string } & SearchSchemaInput): { c?: string } => ({
    c: typeof raw.c === 'string' ? raw.c : undefined,
  }),
  head: () => ({ meta: [{ title: 'Go playground' }] }),
  component: PlaygroundPage,
})

function PlaygroundPage() {
  const { c } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [copied, setCopied] = useState(false)

  const code = c ? decode(c) : DEFAULT

  const load = (src: string) => navigate({ search: { c: encode(src) } })

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <p className="island-kicker mb-2">Scratch</p>
      <h1 className="display-title mb-3 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
        Playground
      </h1>
      <p className="mb-6 max-w-2xl text-[var(--sea-ink-soft)]">
        The program lives in the URL, so a link carries the code with it. Load any snippet
        from the notes below and start breaking it.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)]"
        >
          {copied ? 'copied ✓' : 'copy share link'}
        </button>
        <button
          type="button"
          onClick={() => load(DEFAULT)}
          className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)]"
        >
          blank program
        </button>
      </div>

      <GoRunner key={c ?? 'default'} code={code} minHeight="24rem" />

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-[var(--kicker)]">
        Load a snippet
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {allSnippets.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => load(s.code)}
            className="island-shell rounded-xl px-4 py-3 text-left transition hover:-translate-y-0.5"
          >
            <span className="block text-sm font-semibold text-[var(--sea-ink)]">{s.title}</span>
            <span className="block text-xs text-[var(--sea-ink-soft)]">{s.section}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
