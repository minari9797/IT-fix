'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, helperText, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400',
              'transition-all duration-200 outline-none',
              'focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100',
              'disabled:bg-gray-50 disabled:cursor-not-allowed',
              icon ? 'pl-10' : undefined,
              error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : undefined,
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-400">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
