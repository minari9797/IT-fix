'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
  onClick?: () => void
  hover?: boolean
  /** 'glass' = white/5 backdrop-blur (default) | 'solid' = surface-card bg */
  variant?: 'glass' | 'solid'
}

export default function Card({
  className,
  children,
  onClick,
  hover = false,
  variant = 'glass',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl transition-all duration-200 border border-slate-700/50 shadow-sm',
        variant === 'glass'
          ? 'ds-card'     // bg-white/5 backdrop-blur border-white/10
          : 'ds-card-solid', // bg-[#201f22] border-[#434656]
        hover && 'cursor-pointer hover:bg-white/[0.07]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
