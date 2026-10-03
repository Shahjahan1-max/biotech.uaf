import { cn } from '../utils/cn'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: 'emerald' | 'teal'
}

export function StatCard({ icon, label, value, accent = 'emerald' }: StatCardProps) {
  return (
    <div className="bg-surface rounded-card border border-border-subtle p-5 shadow-card transition-shadow duration-200 ease-smooth hover:shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center ring-1 ring-inset',
            accent === 'emerald'
              ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/10'
              : 'bg-teal-50 text-teal-600 ring-teal-600/10'
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight tabular-nums text-neutral-900">{value}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 mt-0.5">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}
