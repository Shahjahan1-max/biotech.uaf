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
      className="block bg-surface rounded-card border border-border-subtle p-6 shadow-card cursor-pointer transition-all duration-200 ease-smooth hover:shadow-float hover:-translate-y-0.5 hover:border-emerald-200/70 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-4 ring-1 ring-inset transition-colors duration-200',
          accent === 'emerald'
            ? 'bg-emerald-50 text-emerald-600 ring-emerald-600/10 group-hover:bg-emerald-100 group-hover:ring-emerald-600/20'
            : 'bg-teal-50 text-teal-600 ring-teal-600/10 group-hover:bg-teal-100 group-hover:ring-teal-600/20'
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold tracking-tight text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
    </Link>
  )
}
