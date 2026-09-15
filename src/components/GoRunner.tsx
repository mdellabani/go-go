import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import CodeMirror from '@uiw/react-codemirror'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'
import { runGo, type RunResult } from '#/lib/runner'

function useDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains('dark'))
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

function Output({ result, error }: { result?: RunResult; error: Error | null }) {
  if (error) {
    return (
      <pre className="run-output run-output-err">
        {error.message}
        {'\n\n'}Is the runner deployed? See README → “Go runner”.
      </pre>
    )
  }
  if (!result) return null

  const compileErr = result.Errors || result.VetErrors
  if (compileErr) {
    return <pre className="run-output run-output-err">{compileErr}</pre>
  }

  const text = (result.Events ?? []).map((e) => e.Message).join('')
  return <pre className="run-output">{text || '(no output)'}</pre>
}

export default function GoRunner({
  code: initial,
  hint,
  minHeight = '12rem',
}: {
  code: string
  hint?: string
  minHeight?: string
}) {
  const [code, setCode] = useState(initial)
  const dark = useDarkMode()
  const run = useMutation({ mutationFn: (src: string) => runGo(src) })

  const dirty = code !== initial

  return (
    <div className="panel overflow-hidden rounded-lg">
      <div className="flex items-center gap-2 border-b-2 border-[var(--line-hard)] bg-[var(--foam)] px-3 py-2">
        <button
          type="button"
          onClick={() => run.mutate(code)}
          disabled={run.isPending}
          className="btn btn-go"
        >
          {run.isPending ? 'Running…' : 'Run ▸'}
        </button>
        <button
          type="button"
          onClick={() => {
            setCode(initial)
            run.reset()
          }}
          disabled={!dirty}
          className="btn btn-ghost"
        >
          Reset
        </button>
        <span className="kicker ml-auto">{dirty ? 'edited' : 'go.dev'}</span>
      </div>

      <CodeMirror
        value={code}
        height="auto"
        minHeight={minHeight}
        theme={dark ? oneDark : 'light'}
        extensions={[go()]}
        onChange={setCode}
        basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault()
            run.mutate(code)
          }
        }}
      />

      <Output result={run.data} error={run.error} />

      {hint ? (
        <p className="border-t-2 border-[var(--line-hard)] bg-[var(--foam)] px-3 py-2.5 text-[0.8125rem] leading-[1.6] text-[var(--ink-dim)]">
          <span className="mono font-bold text-[var(--accent)]">try it: </span>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
