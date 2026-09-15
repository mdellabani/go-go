export default function Footer() {
  return (
    <footer className="site-footer mt-16 px-4 pb-12 pt-8 text-[var(--ink-dim)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-[0.8125rem]">
          Every snippet is compiled by the official{' '}
          <a href="https://go.dev/play" target="_blank" rel="noreferrer">
            Go playground
          </a>
          , through a Cloudflare Worker. Built with TanStack Start.
        </p>
        <p className="kicker m-0">go-go</p>
      </div>
    </footer>
  )
}
