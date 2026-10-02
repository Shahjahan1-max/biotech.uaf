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
    <div className="flex items-center justify-between mb-6">
      <div>
        <Heading className="text-xl font-semibold text-neutral-900">{title}</Heading>
        {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
