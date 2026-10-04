import { cn } from '../utils/cn'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: 'emerald' | 'teal'
}

export function StatCard({ icon, label, value, accent = 'emerald' }: StatCardProps) {
  return (
    <div className="group h-full relative overflow-hidden bg-surface rounded-card border border-border-subtle p-5 shadow-card ease-smooth transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float hover:border-emerald-200/70">
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-70',
          accent === 'emerald'
            ? 'from-emerald-400/70 via-emerald-300/30 to-transparent'
            : 'from-teal-400/70 via-teal-300/30 to-transparent'
        )}
      />
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-11 h-11 shrink-0 rounded-control flex items-center justify-center ring-1 ring-inset transition-all duration-200',
            accent === 'emerald'
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/70 text-emerald-600 ring-emerald-600/15 group-hover:ring-emerald-600/30'
              : 'bg-gradient-to-br from-teal-50 to-teal-100/70 text-teal-600 ring-teal-600/15 group-hover:ring-teal-600/30'
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-bold tracking-tight tabular-nums text-ink-strong leading-none">
            {value}
          </p>
          <p className="text-xs font-medium text-ink-muted mt-1.5">{label}</p>
        </div>
      </div>
    </div>
  )
}
