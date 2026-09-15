import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-[var(--line-hard)] bg-[var(--header-bg)] px-4 backdrop-blur-md">
      <nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
        <Link
          to="/"
          className="mono flex-shrink-0 text-[0.95rem] font-extrabold tracking-tight text-[var(--ink)] no-underline"
        >
          <span className="text-[var(--accent)]">go</span>-go
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] sm:order-none sm:w-auto">
          <Link
            to="/why/$questionId"
            params={{ questionId: 'jvm' }}
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            orientation
          </Link>
          <Link
            to="/build/$stepId"
            params={{ stepId: 'serve' }}
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            build
          </Link>
          <Link
            to="/notes/$sectionId"
            params={{ sectionId: 'syntax' }}
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            reference
          </Link>
          <Link to="/table" className="nav-link" activeProps={{ className: 'nav-link is-active' }}>
            table
          </Link>
          <Link
            to="/playground"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            playground
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
