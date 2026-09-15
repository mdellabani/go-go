export type RunEvent = { Message: string; Kind: 'stdout' | 'stderr'; Delay: number }

export type RunResult = {
  Errors: string
  VetErrors: string
  Events: RunEvent[] | null
}

const ENDPOINT =
  import.meta.env.VITE_GO_RUNNER_URL ?? 'http://localhost:8787'

export async function runGo(code: string, signal?: AbortSignal): Promise<RunResult> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    signal,
  })
  if (!res.ok && res.status >= 500) {
    throw new Error(`runner unavailable (${res.status})`)
  }
  return (await res.json()) as RunResult
}

export function useIsDark() {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}
