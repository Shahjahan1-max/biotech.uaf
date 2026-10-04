import { Link } from 'react-router-dom'
import { cn } from '../utils/cn'

interface QuickAccessCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  accent?: 'emerald' | 'teal'
}

export function QuickAccessCard({ icon, title, description, href, accent = 'emerald' }: QuickAccessCardProps) {
  return (
    <Link
      to={href}
      className="group relative flex h-full min-h-44 flex-col bg-surface rounded-card border border-border-subtle p-6 shadow-card cursor-pointer transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-0 transition-opacity duration-200 group-hover:opacity-100',
          accent === 'emerald'
            ? 'from-emerald-400/80 via-teal-300/40 to-transparent'
            : 'from-teal-400/80 via-cyan-300/40 to-transparent'
        )}
      />
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center ring-1 ring-inset transition-all duration-200',
            accent === 'emerald'
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600 ring-emerald-600/15 group-hover:ring-emerald-600/30'
              : 'bg-gradient-to-br from-teal-50 to-teal-100/60 text-teal-600 ring-teal-600/15 group-hover:ring-teal-600/30'
          )}
        >
          {icon}
        </div>
        <svg
          aria-hidden="true"
          className="w-4 h-4 mt-1 shrink-0 text-neutral-400 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-emerald-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <h3 className="font-semibold tracking-tight text-ink-strong mb-1 transition-colors duration-150 group-hover:text-emerald-700">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
    </Link>
  )
}
