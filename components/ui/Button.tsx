'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  /** portal context: 'user' = blue, 'tech' = purple */
  portal?: 'user' | 'tech'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, fullWidth, children, disabled, portal = 'user', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none uppercase tracking-widest'

    const variants = {
      primary: portal === 'tech' ? 'ds-btn-purple' : 'ds-btn-blue',
      secondary: 'ds-btn-ghost',
      ghost: 'bg-transparent text-[var(--outline)] hover:text-[var(--on-surface-var)]',
      danger: 'bg-transparent text-[var(--outline)] hover:text-[var(--error)]',
    }

    const sizes = {
      sm: 'px-4 py-2 text-[11px]',
      md: 'px-5 py-2.5 text-[12px]',
      lg: 'px-6 py-3.5 text-[12px]',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading ? <span className="opacity-60">Loading…</span> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
