import { cn } from '../utils/cn'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent?: 'emerald' | 'teal'
}

export function StatCard({ icon, label, value, accent = 'emerald' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            accent === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-50 text-teal-600'
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          <p className="text-sm text-neutral-500">{label}</p>
        </div>
      </div>
    </div>
  )
}
