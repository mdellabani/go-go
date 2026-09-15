import { sections } from '../src/content/sections.ts'
import { orientation } from '../src/content/orientation.ts'
import { track } from '../src/content/track.ts'
import { exercises } from '../src/content/exercises.ts'
import type { Block } from '../src/content/types.ts'

type Case = { where: string; code: string; expect?: string }

const collect = (group: string, id: string, blocks: Block[]): Case[] =>
  blocks
    .filter((b) => b.kind === 'run')
    .map((b) => ({ where: `${group}/${id}/${b.snippet.id}`, code: b.snippet.code }))

const cases: Case[] = [
  ...orientation.flatMap((q) => collect('why', q.id, q.blocks)),
  ...track.flatMap((s) => collect('build', s.id, s.blocks)),
  ...sections.flatMap((s) => collect('notes', s.id, s.blocks)),
  // Starters must compile (they are deliberately wrong, not broken).
  ...Object.entries(exercises).map(([id, e]) => ({
    where: `exercise/${id}/starter`,
    code: e.challenge.starter,
  })),
  // Solutions must compile AND produce exactly the output we promise the reader.
  ...Object.entries(exercises).map(([id, e]) => ({
    where: `exercise/${id}/solution`,
    code: e.challenge.solution,
    expect: e.challenge.expected,
  })),
]

async function run(code: string) {
  const res = await fetch('https://go.dev/_/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ body: code, version: '2', withVet: 'true' }),
  })
  return (await res.json()) as {
    Errors: string
    VetErrors: string
    Events: Array<{ Message: string }> | null
  }
}

let failed = 0

for (const c of cases) {
  const out = await run(c.code)

  if (out.Errors || out.VetErrors) {
    failed++
    console.log(`FAIL ${c.where}\n${out.Errors}${out.VetErrors}`)
  } else if (c.expect !== undefined) {
    const got = (out.Events ?? []).map((e) => e.Message).join('').trimEnd()
    if (got !== c.expect.trimEnd()) {
      failed++
      console.log(`FAIL ${c.where}\n  expected: ${JSON.stringify(c.expect)}\n  got:      ${JSON.stringify(got)}`)
    } else {
      console.log(`ok   ${c.where}  ->  output matches`)
    }
  } else {
    const first = (out.Events ?? []).map((e) => e.Message).join('').split('\n')[0]
    console.log(`ok   ${c.where}  ->  ${first}`)
  }

  await new Promise((r) => setTimeout(r, 350))
}

console.log(`\n${cases.length - failed}/${cases.length} checks pass`)
if (failed) process.exit(1)
