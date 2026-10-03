import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  to?: string
}

function buttonClasses(
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
  className?: string
) {
  return cn(
    'inline-flex items-center justify-center font-medium rounded-control transition-all duration-150 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed',
    {
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/20 ring-1 ring-inset ring-emerald-700/20': variant === 'primary',
      'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm shadow-teal-600/20 ring-1 ring-inset ring-teal-700/20': variant === 'secondary',
      'border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-100': variant === 'outline',
      'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:bg-neutral-200': variant === 'ghost',
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20 ring-1 ring-inset ring-red-700/20': variant === 'danger',
    },
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg',
    },
    className
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  to,
  ...props
}: ButtonProps) {
  if (to !== undefined) {
    return (
      <Link to={to} className={buttonClasses(variant, size, className)}>
        {children}
      </Link>
    )
  }

  return (
    <button className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </button>
  )
}
