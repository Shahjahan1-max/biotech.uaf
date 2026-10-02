import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  to?: string
}

function buttonClasses(
  variant: ButtonProps['variant'],
  size: ButtonProps['size'],
  className?: string
) {
  return cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
    {
      'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm': variant === 'primary',
      'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-sm': variant === 'secondary',
      'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100': variant === 'outline',
      'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100': variant === 'ghost',
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
