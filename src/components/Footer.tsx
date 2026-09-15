export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">
          Programs are compiled by the official{' '}
          <a href="https://go.dev/play" target="_blank" rel="noreferrer" className="underline">
            Go playground
          </a>
          . Built with TanStack Start.
        </p>
        <p className="island-kicker m-0">Go for Java devs</p>
      </div>
    </footer>
  )
}
