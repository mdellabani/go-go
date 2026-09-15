import { sections } from '../src/content/sections.ts'

const runnable = sections.flatMap((s) =>
  s.blocks.filter((b) => b.kind === 'run').map((b) => ({ section: s.id, ...b.snippet })),
)

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

  const label = `${s.section}/${s.id}`
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
