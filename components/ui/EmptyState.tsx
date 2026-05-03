'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in',
      className
    )}>
      <p className="uppercase tracking-widest text-xs text-slate-600 mb-3">— empty —</p>
      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 mb-8 max-w-[280px] leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          {action}
        </div>
      )}
    </div>
  )
}
