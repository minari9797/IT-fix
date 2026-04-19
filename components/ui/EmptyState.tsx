'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in",
        className
    )}>
      <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
            {icon}
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-[280px] leading-relaxed font-medium">
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
