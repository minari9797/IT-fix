'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  helperText?: string
  /** 'user' = blue focus ring (default) | 'tech' = purple focus ring */
  portal?: 'user' | 'tech'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, helperText, id, portal = 'user', ...props }, ref) => {
    const focusColor = portal === 'tech'
      ? 'focus:border-[var(--secondary)] focus:ring-1 focus:ring-[var(--secondary)]/30'
      : 'focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30'

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="ds-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--outline)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full bg-[#1c1b1d] border border-white/[0.06] rounded-xl px-4 py-3',
              'text-[var(--on-bg)] text-sm placeholder:text-[var(--outline-var)]',
              'transition-all duration-200 outline-none shadow-inner',
              focusColor,
              'disabled:opacity-40 disabled:cursor-not-allowed',
              icon ? 'pl-12' : undefined,
              error ? 'border-[var(--error)]/50 focus:border-[var(--error)]' : undefined,
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[var(--error)] mt-0.5">{error}</p>}
        {helperText && !error && <p className="text-xs text-[var(--outline)] mt-0.5">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
