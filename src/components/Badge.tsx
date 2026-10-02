import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variant?: 'emerald' | 'teal' | 'neutral' | 'amber'
}

export function Badge({ children, variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-emerald-50 text-emerald-700 border border-emerald-200': variant === 'emerald',
          'bg-teal-50 text-teal-700 border border-teal-200': variant === 'teal',
          'bg-neutral-100 text-neutral-600 border border-neutral-200': variant === 'neutral',
          'bg-amber-50 text-amber-700 border border-amber-200': variant === 'amber',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
