import { sections } from '../src/content/sections.ts'
import { orientation } from '../src/content/orientation.ts'
import { track } from '../src/content/track.ts'
import type { Block } from '../src/content/types.ts'

const collect = (group: string, id: string, blocks: Block[]) =>
  blocks.filter((b) => b.kind === 'run').map((b) => ({ where: `${group}/${id}`, ...b.snippet }))

const runnable = [
  ...orientation.flatMap((q) => collect('why', q.id, q.blocks)),
  ...track.flatMap((s) => collect('build', s.id, s.blocks)),
  ...sections.flatMap((s) => collect('notes', s.id, s.blocks)),
]

let failed = 0

for (const s of runnable) {
  const res = await fetch('https://go.dev/_/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ body: s.code, version: '2', withVet: 'true' }),
  })
  const out = (await res.json()) as {
    Errors: string
    VetErrors: string
    Events: Array<{ Message: string }> | null
  }

  const label = `${s.where}/${s.id}`
  if (out.Errors || out.VetErrors) {
    failed++
    console.log(`FAIL ${label}\n${out.Errors}${out.VetErrors}`)
  } else {
    const first = (out.Events ?? []).map((e) => e.Message).join('').split('\n')[0]
    console.log(`ok   ${label}  ->  ${first}`)
  }
  await new Promise((r) => setTimeout(r, 400))
}

console.log(`\n${runnable.length - failed}/${runnable.length} snippets compile`)
if (failed) process.exit(1)
