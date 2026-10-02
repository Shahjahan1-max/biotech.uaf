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
      className="block bg-white rounded-xl border border-neutral-200 p-6 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-neutral-300 hover:-translate-y-0.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200',
          accent === 'emerald'
            ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
            : 'bg-teal-50 text-teal-600 group-hover:bg-teal-100'
        )}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500">{description}</p>
    </Link>
  )
}
