'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/50', className)} />
  )
}

export function TicketCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function TechnicianCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6 relative overflow-hidden">
      {/* Accent bar */}
      <Skeleton className="absolute top-0 left-0 right-0 h-1 rounded-none rounded-t-xl" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-700/60 mb-4" />

      {/* Info rows */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-2 w-12" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-2 w-10" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
