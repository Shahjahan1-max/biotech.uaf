import { cn } from '../utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

export function Spinner({ size = 'md', label = 'Loading', className }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className={className}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-emerald-100 border-b-emerald-600',
          size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
