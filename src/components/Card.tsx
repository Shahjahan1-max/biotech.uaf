import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-card border border-border-subtle shadow-card transition-shadow duration-200 ease-smooth',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
