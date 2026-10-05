import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  eyebrow?: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

function BrandMark({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path strokeLinecap="round" d="M7.5 3.5c0 4.5 9 4.5 9 8.5s-9 4-9 8.5" />
      <path strokeLinecap="round" d="M16.5 3.5c0 4.5-9 4.5-9 8.5s9 4 9 8.5" />
      <path strokeLinecap="round" d="M9.5 7.5h5M9.5 12h5M9.5 16.5h5" />
      <circle cx="7.5" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="3.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

const HIGHLIGHTS = [
  'Notes, study guides & references',
  'Assignments with deadline tracking',
  'Discussions, timetable & announcements',
]

export function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-canvas biotech-motif lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14 text-white"
        style={{ backgroundImage: 'var(--gradient-deep)' }}
        aria-hidden="true"
      >
        <span
          className="pointer-events-none absolute -top-40 -left-32 h-[30rem] w-[30rem] rounded-full opacity-70"
          style={{ backgroundImage: 'var(--gradient-halo)' }}
        />
        <span
          className="pointer-events-none absolute -bottom-48 -right-40 h-[36rem] w-[36rem] rounded-full opacity-50"
          style={{ backgroundImage: 'var(--gradient-halo)' }}
        />
        <svg
          className="pointer-events-none absolute -right-16 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 text-emerald-200/10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={0.6}
        >
          <path strokeLinecap="round" d="M7.5 3.5c0 4.5 9 4.5 9 8.5s-9 4-9 8.5" />
          <path strokeLinecap="round" d="M16.5 3.5c0 4.5-9 4.5-9 8.5s9 4 9 8.5" />
          <path strokeLinecap="round" d="M9.5 7.5h5M9.5 12h5M9.5 16.5h5" />
        </svg>
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.14) 1px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/25 shadow-sm shadow-black/20">
            <BrandMark className="w-5 h-5 text-white" />
          </span>
          <div>
            <span className="block text-base font-semibold tracking-tight text-white">
              Biotechnology
            </span>
            <span className="block text-sm font-medium text-emerald-200">— Section A</span>
          </div>
        </div>

        <div className="relative max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
            Biotech Section A
          </p>
          <h2 className="mt-4 text-3xl xl:text-4xl font-semibold tracking-tight leading-tight text-white">
            Lab-grade precision,
            <br />
            campus-grade collaboration.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-emerald-100/85">
            One course hub for the semester — lecture notes, assignments, class discussions,
            and your weekly timetable, kept in sync for every student.
          </p>
          <ul className="mt-7 flex flex-col gap-2.5">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="inline-flex w-fit items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-emerald-50 ring-1 ring-inset ring-white/15"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/25 text-emerald-200">
                  <svg
                    className="h-2.5 w-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-emerald-100/60">
          Biotechnology — Section A · Course portal
        </p>
      </aside>

      <main className="flex min-h-screen flex-col lg:min-h-0">
        <div className="flex items-center justify-between px-4 pt-5 sm:px-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 flex items-center justify-center rounded-xl shadow-sm ring-1 ring-inset ring-white/40"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            >
              <BrandMark className="w-5 h-5 text-white" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-transparent bg-clip-text"
              style={{ backgroundImage: 'var(--gradient-brand)' }}
            >
              Biotechnology
            </span>
          </Link>
          <span className="text-xs font-medium text-ink-muted">Student Portal</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
          <div className="w-full max-w-md animate-fade-up">
            <header className="mb-6 text-center sm:text-left">
              {eyebrow && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink-strong">
                {title}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
            </header>

            <div className="bg-surface rounded-panel border border-border-subtle shadow-panel p-6 sm:p-8">
              {children}
            </div>

            <p className="mt-6 text-center text-sm text-ink-muted">{footer}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
