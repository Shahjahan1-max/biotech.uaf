import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  as?: 'h1' | 'h2'
}

export function SectionHeader({ title, subtitle, action, as = 'h2' }: SectionHeaderProps) {
  const Heading = as
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="min-w-0">
        <Heading className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
          {title}
        </Heading>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-1 leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
