import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { SearchSchemaInput } from '@tanstack/react-router'
import GoRunner from '#/components/GoRunner'
import { sections } from '#/content/sections'
import { orientation } from '#/content/orientation'
import { track } from '#/content/track'
import type { Block } from '#/content/types'

const DEFAULT = `package main

import "fmt"

func main() {
	fmt.Println("edit me, then hit Run (Ctrl/Cmd+Enter)")
}
`

const pick = (group: string, blocks: Block[]) =>
  blocks.filter((b) => b.kind === 'run').map((b) => ({ group, ...b.snippet }))

const allSnippets = [
  ...orientation.flatMap((q) => pick('orientation', q.blocks)),
  ...track.flatMap((s) => pick(`build · ${s.title}`, s.blocks)),
  ...sections.flatMap((s) => pick(`reference · ${s.title}`, s.blocks)),
]

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
  head: () => ({ meta: [{ title: 'Playground — go-go' }] }),
  component: PlaygroundPage,
})

function PlaygroundPage() {
  const { c } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const [copied, setCopied] = useState(false)

  const code = c ? decode(c) : DEFAULT
  const load = (src: string) => navigate({ search: { c: encode(src) } })

  return (
    <main className="page-wrap px-4 pb-16 pt-8">
      <p className="kicker mb-2">scratch</p>
      <h1 className="display mb-3 text-2xl text-[var(--ink)] sm:text-[2rem]">Playground</h1>
      <p className="mb-6 max-w-2xl text-[0.95rem] leading-[1.7] text-[var(--ink-dim)]">
        The program is base64-encoded into the URL, so a link carries the code with it. Load any
        snippet from the site and start breaking it.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
          className="btn btn-ghost"
        >
          {copied ? 'copied ✓' : 'copy share link'}
        </button>
        <button type="button" onClick={() => load(DEFAULT)} className="btn btn-ghost">
          blank program
        </button>
      </div>

      <GoRunner key={c ?? 'default'} code={code} minHeight="24rem" />

      <h2 className="kicker mb-3 mt-10">load a snippet</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {allSnippets.map((s) => (
          <button
            key={s.group + s.id}
            type="button"
            onClick={() => load(s.code)}
            className="panel card-lift rounded-lg px-4 py-3 text-left transition"
          >
            <span className="mono block text-[0.8125rem] font-bold text-[var(--ink)]">
              {s.title}
            </span>
            <span className="kicker mt-0.5 block">{s.group}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
